package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.FleetOccurrence;
import com.satelitenorte.sisget.repository.FleetOccurrenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/fleet/occurrences")
public class FleetOccurrenceController {

    @Autowired
    private FleetOccurrenceRepository repository;

    @GetMapping
    public List<FleetOccurrence> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public FleetOccurrence save(@RequestBody FleetOccurrence occurrence) {
        occurrence.setLastUpdated(LocalDateTime.now());
        return repository.save(occurrence);
    }

    @DeleteMapping("/{vehicleId}")
    public void delete(@PathVariable String vehicleId) {
        repository.deleteById(vehicleId);
    }
}
