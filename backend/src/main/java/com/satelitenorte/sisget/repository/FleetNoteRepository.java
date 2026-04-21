package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FleetNoteRepository extends JpaRepository<FleetNote, Long> {
    List<FleetNote> findAllByOrderByCreatedAtDesc();
}
