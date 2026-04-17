package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.dto.EscalaFluxoDTO;
import com.satelitenorte.sisget.model.EscalaFluxo;
import com.satelitenorte.sisget.repository.EscalaFluxoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EscalaFluxoService {

    private final EscalaFluxoRepository repository;

    public List<EscalaFluxo> buscarPorData(LocalDate data) {
        return repository.findByData(data);
    }

    @Transactional
    public void sincronizarEscala(List<EscalaFluxoDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        // Agrupa os DTOs recebidos por Data para tratar "Carregar e Atirar" (atualização daquele dia específico)
        // Isso atende a RN04-02 de forma robusta e atômica.
        Map<LocalDate, List<EscalaFluxoDTO>> dtosPorData = dtos.stream()
                .collect(Collectors.groupingBy(dto -> LocalDate.parse(dto.getData())));

        for (Map.Entry<LocalDate, List<EscalaFluxoDTO>> entry : dtosPorData.entrySet()) {
            LocalDate dataParaSincronizar = entry.getKey();
            List<EscalaFluxoDTO> itensDesteDia = entry.getValue();

            // Deleta todos os itens atuais daquela data para evitar sujeira/duplicatas em atualizações parciais
            repository.deleteByData(dataParaSincronizar);

            // Transforma e salva os novos itens limpos vindos do SharePoint
            List<EscalaFluxo> novasEscalas = itensDesteDia.stream()
                    .map(this::converterParaEntidade)
                    .collect(Collectors.toList());

            repository.saveAll(novasEscalas);
        }
    }

    private EscalaFluxo converterParaEntidade(EscalaFluxoDTO dto) {
        return EscalaFluxo.builder()
                .diaSemana(dto.getDiaSemana())
                .data(LocalDate.parse(dto.getData()))
                .garagem(dto.getGaragem())
                .carro(dto.getCarro())
                .horarioGaragem(parseHorario(dto.getHorarioGaragem()))
                .horarioSaida(parseHorario(dto.getHorarioSaida()))
                .origem(dto.getOrigem())
                .destino(dto.getDestino())
                .motorista(dto.getMotorista())
                .linha(dto.getLinha())
                .servico(dto.getServico())
                .build();
    }

    private LocalTime parseHorario(String horarioStr) {
        if (horarioStr == null || horarioStr.trim().isEmpty() || horarioStr.equalsIgnoreCase("null")) {
            return null;
        }
        try {
            // Formatos comuns como "19:30" ou "07:15"
            return LocalTime.parse(horarioStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            try {
               return LocalTime.parse(horarioStr, DateTimeFormatter.ofPattern("HH:mm:ss"));
            } catch (DateTimeParseException ex) {
               return null; // ou lançar uma exceção de formatação
            }
        }
    }
}
