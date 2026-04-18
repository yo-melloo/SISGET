package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.FleetCurrent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FleetCurrentRepository extends JpaRepository<FleetCurrent, String> {
    
    @Modifying
    @Transactional
    @Query("UPDATE FleetCurrent f SET f.dnitMcr = :mcr WHERE f.vehicleId = :id")
    void updateMcrLocation(@org.springframework.data.repository.query.Param("id") String id, @org.springframework.data.repository.query.Param("mcr") String mcr);
}
