package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.dto.EscalaFluxoDTO;
import com.satelitenorte.sisget.model.EscalaFluxo;
import com.satelitenorte.sisget.service.EscalaFluxoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/escalas")
@RequiredArgsConstructor
public class EscalaFluxoController {

    private final EscalaFluxoService service;

    @GetMapping
    public ResponseEntity<List<EscalaFluxo>> getEscalasPorData(
            @RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        List<EscalaFluxo> escalas = service.buscarPorData(data);
        return ResponseEntity.ok(escalas);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sincronizarEscala(
            @RequestBody List<EscalaFluxoDTO> escalasSync) {
        
        service.sincronizarEscala(escalasSync);
        
        return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Escalas sincronizadas com sucesso. Total de itens reprocessados: " + escalasSync.size()
        ));
    }
}
