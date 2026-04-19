package com.satelitenorte.sisget;

import com.satelitenorte.sisget.config.DataSeeder;
import com.satelitenorte.sisget.model.Motorista;
import com.satelitenorte.sisget.model.Usuario;
import com.satelitenorte.sisget.repository.MotoristaRepository;
import com.satelitenorte.sisget.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabaseIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void verifySeedingAndMigrations() {
        // Verify Bean Existence
        assertTrue(context.containsBean("dataSeeder"), "Bean DataSeeder deve existir");

        // Verify Admin User (V2 Migration)
        Usuario adminUser = usuarioRepository.findByMatricula("5418").orElse(null);
        assertNotNull(adminUser, "Usuário administrador deve existir (V2 Migration)");
        assertFalse(adminUser.getNome().isBlank(), "O nome do administrador deve estar preenchido");

        // Verify Motoristas (DataSeeder)
        long motoristaCount = motoristaRepository.count();
        assertTrue(motoristaCount >= 604, "Devem existir pelo menos 604 motoristas semeados, encontrado: " + motoristaCount);

        // Verify Veiculos (DataSeeder)
        long veiculoCount = context.getBean(com.satelitenorte.sisget.repository.VeiculoRepository.class).count();
        assertTrue(veiculoCount >= 165, "Devem existir pelo menos 165 veículos semeados");

        // Verify Reservas (DataSeeder)
        long reservaCount = context.getBean(com.satelitenorte.sisget.repository.ReservaRepository.class).count();
        assertTrue(reservaCount >= 5, "Devem existir reservas semeadas");
    }
}
