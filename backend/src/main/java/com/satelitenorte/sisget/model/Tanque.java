package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tanques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tanque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "capacidade_max")
    private Double capacidadeMax;

    @Column(name = "nivel_atual_cm")
    private Double nivelAtualCm;
}
