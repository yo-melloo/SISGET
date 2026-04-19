package com.satelitenorte.sisget.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fleet_current")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetCurrent {
    
    @Id
    @Column(name = "vehicle_id")
    private String vehicleId; // Prefixo ou Código
    
    private String plate;
    private Double latitude;
    private Double longitude;
    private Double speed;
    
    @Column(name = "driver_name")
    private String driverName;
    
    @Column(name = "route_name")
    private String routeName;
    
    @Column(name = "area_name")
    private String areaName;  // Região LIFE
    
    private String status;
    
    @Column(name = "transmission_date")
    private String transmissionDate;
    
    private String odometer;
    
    @Column(name = "fuel_level")
    private String fuelLevel;
    
    private String category;
    private String rpm;
    
    // DNIT: Marco Quilométrico (Enriquecido via Fase 5)
    @Column(name = "mcr_location")
    private String dnitMcr; 

    @Column(name = "city_location")
    private String cityLocation;
    
    @Column(name = "last_backend_update")
    private LocalDateTime lastBackendUpdate;
}
