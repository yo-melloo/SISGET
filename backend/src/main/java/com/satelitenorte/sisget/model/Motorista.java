package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "motoristas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String matricula;
}
