package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.FleetCurrent;
import com.satelitenorte.sisget.service.FleetStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fleet")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true") 
public class FleetStatusController {

    private final FleetStatusService fleetStatusService;

    @GetMapping("/latest")
    public Map<String, Object> getLatestFleetStatus() {
        return Map.of(
            "fleet", fleetStatusService.getAllLatest(),
            "lastSync", fleetStatusService.getLastGlobalSync().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        );
    }

    @PostMapping("/update-batch")
    public ResponseEntity<?> updateFleetBatch(
            @RequestHeader("X-Internal-Key") String apiKey,
            @RequestBody List<FleetCurrent> batch) {
        
        if (!fleetStatusService.validateApiKey(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chave de API inválida");
        }
        
        fleetStatusService.updateFleetStatus(batch);
        return ResponseEntity.ok(Map.of("message", "Frota atualizada com sucesso", "count", batch.size()));
    }

    @GetMapping("/auto-status")
    public Map<String, Boolean> getAutoRefreshStatus() {
        return Map.of("active", fleetStatusService.isAutoRefreshActive());
    }

    @PostMapping("/toggle-auto")
    public Map<String, Boolean> toggleAutoRefresh(@RequestBody Map<String, Boolean> payload) {
        boolean active = payload.getOrDefault("active", false);
        fleetStatusService.setAutoRefreshActive(active);
        return Map.of("active", fleetStatusService.isAutoRefreshActive());
    }

    @GetMapping("/sync-info")
    public Map<String, Object> getSyncInfo() {
        return Map.of(
            "lastSync", fleetStatusService.getLastGlobalSync().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
            "autoActive", fleetStatusService.isAutoRefreshActive()
        );
    }
}
