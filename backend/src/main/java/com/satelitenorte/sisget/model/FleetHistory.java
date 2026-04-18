package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fleet_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private String status;
    private String transmissionDate;
    
    private LocalDateTime recordedAt;
}
