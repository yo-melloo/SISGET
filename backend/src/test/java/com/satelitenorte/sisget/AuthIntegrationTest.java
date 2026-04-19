package com.satelitenorte.sisget;

import com.satelitenorte.sisget.dto.AuthRequest;
import com.satelitenorte.sisget.dto.AuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.satelitenorte.sisget.repository.UsuarioRepository usuarioRepository;

    @Test
    void testAuthFlow() throws Exception {
        // 1. Try to access protected route without token
        mockMvc.perform(get("/api/tanques"))
                .andExpect(status().isForbidden());

        // 2. Login with correct credentials (from V2 migration)
        AuthRequest loginRequest = AuthRequest.builder()
                .matricula("5418")
                .senha("5418")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        assertNotNull(authResponse.getToken());
        assertEquals("Gustavo Oliveira Melo", authResponse.getNome());

        // 3. Access protected route with valid token
        mockMvc.perform(get("/api/fleet/sync-info")
                .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testLoginFailure() throws Exception {
        AuthRequest badRequest = AuthRequest.builder()
                .matricula("5418")
                .senha("wrong-password")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badRequest))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
