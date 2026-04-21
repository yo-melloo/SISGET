package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.model.FleetNote;
import com.satelitenorte.sisget.repository.FleetNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/fleet/notes")
@RequiredArgsConstructor
public class FleetNoteController {

    private final FleetNoteRepository repository;

    @GetMapping
    public List<FleetNote> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public FleetNote create(@RequestBody FleetNote note) {
        if (note.getCreatedAt() == null) {
            note.setCreatedAt(LocalDateTime.now());
        }
        return repository.save(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
