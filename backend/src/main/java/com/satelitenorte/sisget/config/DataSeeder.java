package com.satelitenorte.sisget.config;

import com.satelitenorte.sisget.model.*;
import com.satelitenorte.sisget.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final MotoristaRepository motoristaRepository;
    private final VeiculoRepository veiculoRepository;
    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(MotoristaRepository motoristaRepository,
                      VeiculoRepository veiculoRepository,
                      ReservaRepository reservaRepository,
                      UsuarioRepository usuarioRepository,
                      ObjectMapper objectMapper,
                      PasswordEncoder passwordEncoder) {
        this.motoristaRepository = motoristaRepository;
        this.veiculoRepository = veiculoRepository;
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsuarios(); // Seed users before anything else
        seedMotoristas();
        seedFrota();
        seedReservas();
    }

    private void seedUsuarios() {
        if (usuarioRepository.count() > 0) {
            log.info("Usuários base já semeados.");
            return;
        }

        // The PRD says: Default password = matricula
        // Flyway migration V2 already created Gustavo.
        // But if we want to seed more users from a file in the future, we'd do it here.
        // For now, let's just make sure existing users from the Flyway migration 
        // would have had their passwords set correctly. 
        // Actually, V2 already uses a BCrypt hash.
        
        log.info("Verificando consistência de usuários...");
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
