package com.satelitenorte.sisget.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fleet_current")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetCurrent {
    
    @Id
    private String vehicleId; // Prefixo ou Código
    
    private String plate;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private String driverName;
    private String routeName;
    private String areaName;
    private String status;
    private String transmissionDate;
    private String odometer;
    private String fuelLevel;
    private String category;
    private String rpm;
    
    private LocalDateTime lastBackendUpdate;
}
