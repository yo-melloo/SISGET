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

    @Value("${sisget.internal.api-key:sisget-secret-123}")
    private String internalApiKey;

    private final AtomicBoolean autoRefreshActive = new AtomicBoolean(false);

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
        
        for (FleetCurrent incoming : batch) {
            incoming.setLastBackendUpdate(now);
            
            // 1. Verifica se houve mudança significativa para logar no histórico
            Optional<FleetCurrent> existingOpt = currentRepository.findById(incoming.getVehicleId());
            
            if (existingOpt.isPresent()) {
                FleetCurrent existing = existingOpt.get();
                if (hasMovedOrChanged(existing, incoming)) {
                    saveToHistory(incoming, now);
                }
            } else {
                // Primeira vez que vemos o veículo
                saveToHistory(incoming, now);
            }
            
            // 2. Atualiza o status atual (Upsert)
            currentRepository.save(incoming);
        }
        log.info("Batch de frota processado: {} veículos atualizados.", batch.size());
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
    }

    public List<FleetCurrent> getAllLatest() {
        return currentRepository.findAll();
    }
}
