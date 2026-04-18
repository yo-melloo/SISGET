package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetCurrent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FleetCurrentRepository extends JpaRepository<FleetCurrent, String> {
}
