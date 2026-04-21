package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.FleetPositioningStatic;
import com.satelitenorte.sisget.repository.FleetPositioningStaticRepository;
import com.satelitenorte.sisget.service.GarageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fleet/static-pos")
@RequiredArgsConstructor
public class FleetPositioningStaticController {

    private final FleetPositioningStaticRepository repository;
    private final GarageService garageService;

    @GetMapping
    public List<FleetPositioningStatic> listAll() {
        return repository.findAll();
    }

    @GetMapping("/base/{base}")
    public List<FleetPositioningStatic> findByBase(@PathVariable String base) {
        return repository.findByBase(base.toUpperCase());
    }

    @PostMapping
    public FleetPositioningStatic save(@RequestBody FleetPositioningStatic pos) {
        return repository.save(pos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        garageService.deleteFleetPosition(id);
        return ResponseEntity.ok().build();
    }
}
