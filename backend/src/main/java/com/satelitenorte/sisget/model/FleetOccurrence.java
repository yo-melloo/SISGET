package com.satelitenorte.sisget.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fleet_occurrences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FleetOccurrence {
    
    @Id
    private String vehicleId;
    
    private String occurrenceText;
    
    private LocalDateTime lastUpdated;
}
