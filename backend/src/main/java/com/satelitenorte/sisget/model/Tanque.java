package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @Column(name = "capacidade_l")
    private Double capacidadeL;

    @Column(name = "medicao_cm")
    private Double medicaoCm;

    @Column(name = "volume_l")
    private Double volumeL;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @Column(name = "atualizado_por")
    private String atualizadoPor;
}
