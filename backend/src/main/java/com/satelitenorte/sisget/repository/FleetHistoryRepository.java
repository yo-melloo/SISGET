package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FleetHistoryRepository extends JpaRepository<FleetHistory, Long> {
}
