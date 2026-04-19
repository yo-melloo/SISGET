package com.satelitenorte.sisget.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.satelitenorte.sisget.model.Motorista;
import com.satelitenorte.sisget.model.Reserva;
import com.satelitenorte.sisget.model.Veiculo;
import com.satelitenorte.sisget.repository.MotoristaRepository;
import com.satelitenorte.sisget.repository.ReservaRepository;
import com.satelitenorte.sisget.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final MotoristaRepository motoristaRepository;
    private final VeiculoRepository veiculoRepository;
    private final ReservaRepository reservaRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    public DataSeeder(MotoristaRepository motoristaRepository, 
                      VeiculoRepository veiculoRepository, 
                      ReservaRepository reservaRepository, 
                      ObjectMapper objectMapper, 
                      ResourceLoader resourceLoader) {
        this.motoristaRepository = motoristaRepository;
        this.veiculoRepository = veiculoRepository;
        this.reservaRepository = reservaRepository;
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) throws Exception {
        seedMotoristas();
        seedFrota();
        seedReservas();
    }

    private void seedMotoristas() {
        if (motoristaRepository.count() > 0) {
            log.info("Motoristas já semeados. Pulando.");
            return;
        }

        try {
            String path = "../seeds/motoristas.json";
            java.io.File file = new java.io.File(path);
            
            if (!file.exists()) {
                log.error("Arquivo não encontrado: {}", file.getAbsolutePath());
                return;
            }

            log.info("Semeando motoristas a partir de motoristas.json...");
            InputStream is = new java.io.FileInputStream(file);
            List<Motorista> motoristas = objectMapper.readValue(is, new TypeReference<List<Motorista>>() {});
            motoristaRepository.saveAll(motoristas);
            log.info("Sucesso: {} motoristas importados.", motoristas.size());
        } catch (Exception e) {
            log.error("Erro ao semear motoristas: {}", e.getMessage(), e);
        }
    }

    private void seedFrota() {
        if (veiculoRepository.count() > 0) {
            log.info("Frota já semeada. Pulando.");
            return;
        }

        try {
            String path = "../seeds/frota.json";
            java.io.File file = new java.io.File(path);
            
            if (!file.exists()) {
                log.error("Arquivo de frota não encontrado: {}", file.getAbsolutePath());
                return;
            }

            log.info("Semeando frota a partir de frota.json...");
            InputStream is = new java.io.FileInputStream(file);
            List<Veiculo> veiculos = objectMapper.readValue(is, new TypeReference<List<Veiculo>>() {});
            veiculoRepository.saveAll(veiculos);
            log.info("Sucesso: {} veículos importados.", veiculos.size());
        } catch (Exception e) {
            log.error("Erro ao semear frota: {}", e.getMessage());
        }
    }

    private void seedReservas() {
        if (reservaRepository.count() > 0) {
            log.info("Reservas já semeadas. Pulando.");
            return;
        }

        try {
            String path = "../seeds/reservas.json";
            java.io.File file = new java.io.File(path);
            
            if (!file.exists()) {
                log.error("Arquivo de reservas não encontrado: {}", file.getAbsolutePath());
                return;
            }

            log.info("Semeando reservas a partir de reservas.json...");
            InputStream is = new java.io.FileInputStream(file);
            List<Reserva> reservas = objectMapper.readValue(is, new TypeReference<List<Reserva>>() {});
            reservaRepository.saveAll(reservas);
            log.info("Sucesso: {} reservas importadas.", reservas.size());
        } catch (Exception e) {
            log.error("Erro ao semear reservas: {}", e.getMessage());
        }
    }
}
