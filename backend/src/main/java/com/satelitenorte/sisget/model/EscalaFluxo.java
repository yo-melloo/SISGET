package com.satelitenorte.sisget.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "escala_fluxo", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"data_escala", "servico", "origem", "destino"})
})
public class EscalaFluxo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dia_semana", nullable = false)
    private String diaSemana;

    @Column(name = "data_escala", nullable = false)
    private LocalDate data;

    @Column(name = "garagem")
    private String garagem;

    @Column(name = "carro")
    private String carro;

    @Column(name = "horario_garagem")
    private LocalTime horarioGaragem;

    @Column(name = "horario_saida")
    private LocalTime horarioSaida;

    @Column(name = "origem")
    private String origem;

    @Column(name = "destino")
    private String destino;

    @Column(name = "motorista")
    private String motorista;

    @Column(name = "linha")
    private String linha;

    @Column(name = "servico", nullable = false)
    private String servico;
}
