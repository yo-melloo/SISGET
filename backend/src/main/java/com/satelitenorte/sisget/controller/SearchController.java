package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.Motorista;
import com.satelitenorte.sisget.model.Veiculo;
import com.satelitenorte.sisget.repository.MotoristaRepository;
import com.satelitenorte.sisget.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SearchController {

    private final MotoristaRepository motoristaRepository;
    private final VeiculoRepository veiculoRepository;
    private final com.satelitenorte.sisget.repository.FleetCurrentRepository fleetCurrentRepository;
    private final com.satelitenorte.sisget.service.ReverseGeocodingService reverseGeocodingService;

    @GetMapping("/motorista/{query}")
    public ResponseEntity<Motorista> getMotorista(@PathVariable String query) {
        // Tenta por matrícula exata primeiro
        return motoristaRepository.findByMatricula(query)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Se não for matrícula, pode ser parte do nome (limitando a 1)
                    // Note: This is a simplification for the popup
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/veiculo/{prefixo}")
    public ResponseEntity<Veiculo> getVeiculo(@PathVariable String prefixo) {
        return veiculoRepository.findByPrefixo(prefixo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/geocoding/vehicle/{prefixo}")
    public ResponseEntity<java.util.Map<String, String>> getVehicleLocation(@PathVariable String prefixo) {
        return fleetCurrentRepository.findById(prefixo)
                .map(fleet -> {
                    String city = reverseGeocodingService.getCityFromCoords(fleet.getLatitude(), fleet.getLongitude());
                    // Salva no banco para futuras consultas (cache persistente)
                    reverseGeocodingService.saveCityLocation(prefixo, city);
                    return ResponseEntity.ok(java.util.Map.of("city", city));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
