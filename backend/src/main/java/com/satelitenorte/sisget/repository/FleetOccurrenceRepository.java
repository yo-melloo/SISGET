package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FleetOccurrenceRepository extends JpaRepository<FleetOccurrence, String> {
}
