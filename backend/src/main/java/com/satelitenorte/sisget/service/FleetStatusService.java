package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.model.FleetCurrent;
import com.satelitenorte.sisget.model.FleetHistory;
import com.satelitenorte.sisget.repository.FleetCurrentRepository;
import com.satelitenorte.sisget.repository.FleetHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class FleetStatusService {

    private final FleetCurrentRepository currentRepository;
    private final FleetHistoryRepository historyRepository;
    private final DnitMcrService dnitMcrService;
    private final ReverseGeocodingService reverseGeocodingService;

    @Value("${sisget.internal.api-key:sisget-secret-123}")
    private String internalApiKey;

    private final AtomicBoolean autoRefreshActive = new AtomicBoolean(false);
    private LocalDateTime lastGlobalSync = LocalDateTime.now();

    // Fila para geocodificação sequencial (Evita 429 Nominatim)
    private final java.util.concurrent.BlockingQueue<String> geocodingQueue = new java.util.concurrent.LinkedBlockingQueue<>();
    private final java.util.concurrent.ExecutorService geocodingExecutor = java.util.concurrent.Executors.newSingleThreadExecutor();

    @jakarta.annotation.PostConstruct
    public void init() {
        geocodingExecutor.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    String vehicleId = geocodingQueue.take();
                    log.info("[GEO-QUEUE] Processando enriquecimento para: {}", vehicleId);
                    
                    currentRepository.findById(vehicleId).ifPresent(fleet -> {
                        if (fleet.getLatitude() != null && fleet.getLongitude() != null) {
                            try {
                                String city = reverseGeocodingService.getCityFromCoords(fleet.getLatitude(), fleet.getLongitude());
                                if (city != null && !city.equals("Local Indeterminado")) {
                                    reverseGeocodingService.saveCityLocation(vehicleId, city);
                                    log.info("[GEO-QUEUE] Sucesso: {} -> {}", vehicleId, city);
                                }
                                // Delay para respeitar rate limit (1 req/sec)
                                Thread.sleep(1100); 
                            } catch (Exception e) {
                                log.error("[GEO-QUEUE] Falha ao geocodificar {}: {}", vehicleId, e.getMessage());
                            }
                        }
                    });
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("[GEO-QUEUE] Erro inesperado na fila: {}", e.getMessage());
                }
            }
        });
    }

    @jakarta.annotation.PreDestroy
    public void shutdown() {
        geocodingExecutor.shutdownNow();
    }

    public boolean validateApiKey(String key) {
        return internalApiKey.equals(key);
    }

    public boolean isAutoRefreshActive() {
        return autoRefreshActive.get();
    }

    public void setAutoRefreshActive(boolean active) {
        this.autoRefreshActive.set(active);
        log.info("Rastreamento Automático: {}", active ? "LIGADO" : "DESLIGADO");
    }

    @Transactional
    public void updateFleetStatus(List<FleetCurrent> batch) {
        LocalDateTime now = LocalDateTime.now();
        int successCount = 0;
        
        for (FleetCurrent incoming : batch) {
            try {
                if (incoming.getVehicleId() == null) {
                    log.warn("[BATCH] Veículo ignorado por ID nulo no JSON");
                    continue;
                }

                incoming.setLastBackendUpdate(now);
                
                // 1. Verifica se houve mudança significativa para logar no histórico
                Optional<FleetCurrent> existingOpt = currentRepository.findById(incoming.getVehicleId());
                
                // Dispara enriquecimento de MCR e Geocodificação em background
                if (incoming.getLatitude() != null && incoming.getLongitude() != null) {
                    try {
                        dnitMcrService.enrichAndSaveMcr(incoming.getVehicleId(), incoming.getLatitude(), incoming.getLongitude());
                        
                        // Busca o estado atual para ver se já temos endereço
                        boolean needsGeo = true;
                        if (existingOpt.isPresent()) {
                            FleetCurrent existing = existingOpt.get();
                            // Se já tem endereço e mudou quase nada (50m), não precisa re-geocodificar
                            if (existing.getCityLocation() != null && 
                                Math.abs(existing.getLatitude() - incoming.getLatitude()) < 0.0005 &&
                                Math.abs(existing.getLongitude() - incoming.getLongitude()) < 0.0005) {
                                needsGeo = false;
                            }
                        }

                        if (needsGeo) {
                            if (!geocodingQueue.contains(incoming.getVehicleId())) {
                                geocodingQueue.offer(incoming.getVehicleId());
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[ENRICH] Falha ao disparar enriquecimento para {}: {}", incoming.getVehicleId(), e.getMessage());
                    }
                }
                
                if (existingOpt.isPresent()) {
                    FleetCurrent existing = existingOpt.get();
                    if (hasMovedOrChanged(existing, incoming)) {
                        saveToHistory(incoming, now);
                    }
                } else {
                    saveToHistory(incoming, now);
                }
                
                // 2. Atualiza o status atual (Upsert)
                currentRepository.save(incoming);
                successCount++;
            } catch (Exception e) {
                log.error("[BATCH] Erro ao processar veículo {}: {}", incoming.getVehicleId(), e.getMessage());
            }
        }
        
        this.lastGlobalSync = now;
        log.info("Processamento finalizado: {}/{} veículos atualizados com sucesso.", successCount, batch.size());
    }

    private boolean hasMovedOrChanged(FleetCurrent old, FleetCurrent next) {
        if (old.getLatitude() == null || old.getLongitude() == null) return true;
        
        // Tolerância de movimento (aprox 10 metros ou mudança de velocidade/status)
        boolean moved = Math.abs(old.getLatitude() - next.getLatitude()) > 0.0001 || 
                        Math.abs(old.getLongitude() - next.getLongitude()) > 0.0001;
        
        boolean velocityChanged = !String.valueOf(old.getSpeed()).equals(String.valueOf(next.getSpeed()));
        boolean statusChanged = (old.getStatus() == null && next.getStatus() != null) || 
                               (old.getStatus() != null && !old.getStatus().equals(next.getStatus()));

        return moved || velocityChanged || statusChanged;
    }

    private void saveToHistory(FleetCurrent vehicle, LocalDateTime timestamp) {
        try {
            FleetHistory history = FleetHistory.builder()
                    .vehicleId(vehicle.getVehicleId())
                    .latitude(vehicle.getLatitude())
                    .longitude(vehicle.getLongitude())
                    .speed(vehicle.getSpeed())
                    .status(vehicle.getStatus())
                    .transmissionDate(vehicle.getTransmissionDate())
                    .recordedAt(timestamp)
                    .build();
            historyRepository.save(history);
        } catch (Exception e) {
            log.error("[HISTORY] Erro ao persistir histórico para {}: {}", vehicle.getVehicleId(), e.getMessage());
        }
    }

    public List<FleetCurrent> getAllLatest() {
        try {
            return currentRepository.findAll();
        } catch (Exception e) {
            log.error("[DB] Erro ao buscar lista de frota: {}", e.getMessage());
            return List.of();
        }
    }

    public LocalDateTime getLastGlobalSync() {
        return lastGlobalSync;
    }
}
