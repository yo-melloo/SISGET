package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "calibracao_tanques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalibracaoTanque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double cm;

    @Column(nullable = false)
    private Double litros;
}
