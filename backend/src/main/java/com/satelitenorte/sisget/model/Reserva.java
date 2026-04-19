package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String tipo; // CARRO / PNEU

    @Column(nullable = false)
    private String status; // DISPONÍVEL / INDISPONÍVEL

    private String descricao;
}
