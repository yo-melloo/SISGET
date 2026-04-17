package com.satelitenorte.sisget.dto;

import lombok.Data;

@Data
public class EscalaFluxoDTO {
    private String diaSemana;
    private String data; // YYYY-MM-DD
    private String garagem;
    private String carro;
    private String horarioGaragem; // HH:mm
    private String horarioSaida; // HH:mm
    private String origem;
    private String destino;
    private String motorista;
    private String linha;
    private String servico;
}
