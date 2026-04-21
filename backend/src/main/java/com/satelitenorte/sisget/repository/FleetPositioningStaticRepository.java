package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetPositioningStatic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FleetPositioningStaticRepository extends JpaRepository<FleetPositioningStatic, Long> {
    List<FleetPositioningStatic> findByBase(String base);
}
