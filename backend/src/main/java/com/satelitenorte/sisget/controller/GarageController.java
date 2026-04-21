package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.Reserva;
import com.satelitenorte.sisget.model.Tanque;
import com.satelitenorte.sisget.service.GarageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/garage")
@RequiredArgsConstructor
public class GarageController {

    private final GarageService garageService;

    @GetMapping("/tanques")
    public List<Tanque> getTanques() {
        return garageService.listTanks();
    }

    @PutMapping("/tanques/{id}")
    public Tanque updateTanque(@PathVariable Long id, @RequestBody Tanque tanque) {
        return garageService.updateTank(id, tanque);
    }

    @GetMapping("/reservas")
    public List<Reserva> getReservas() {
        return garageService.listReservas();
    }

    @PostMapping("/reservas")
    public Reserva saveReserva(@RequestBody Reserva reserva) {
        return garageService.saveReserva(reserva);
    }

    @DeleteMapping("/reservas/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable Long id) {
        garageService.deleteReserva(id);
        return ResponseEntity.ok().build();
    }
}
