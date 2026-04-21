package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fleet_positioning_static")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetPositioningStatic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false)
    private String vehicleId;

    @Column(name = "base", nullable = false)
    private String base; // IMP, BEL, SLZ

    @Column(name = "category", nullable = false)
    private String category;
    
    private String scheduledDate; // For Grade Futura "Quando"

    // Optional fields for Fretamento or other categories
    private String schedule;
    private String origin;
    private String destination;
    
    @Column(name = "end_date")
    private String endDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
