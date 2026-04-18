package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.model.FleetCurrent;
import com.satelitenorte.sisget.model.FleetHistory;
import com.satelitenorte.sisget.repository.FleetCurrentRepository;
import com.satelitenorte.sisget.repository.FleetHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class FleetStatusService {

    private static final Logger log = LoggerFactory.getLogger(FleetStatusService.class);

    private final FleetCurrentRepository currentRepository;
    private final FleetHistoryRepository historyRepository;
    private final DnitMcrService dnitMcrService;

    @Value("${sisget.internal.api-key:sisget-secret-123}")
    private String internalApiKey;

    private final AtomicBoolean autoRefreshActive = new AtomicBoolean(false);
    private LocalDateTime lastGlobalSync = LocalDateTime.now();

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
                
                // Fase 5: Dispara enriquecimento de MCR em background
                if (incoming.getLatitude() != null && incoming.getLongitude() != null) {
                    try {
                        dnitMcrService.enrichAndSaveMcr(incoming.getVehicleId(), incoming.getLatitude(), incoming.getLongitude());
                    } catch (Exception e) {
                        log.warn("[MCR] Falha ao disparar enriquecimento assíncrono para {}: {}", incoming.getVehicleId(), e.getMessage());
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
