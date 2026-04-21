package com.satelitenorte.sisget;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.satelitenorte.sisget.dto.AuthRequest;
import com.satelitenorte.sisget.dto.AuthResponse;
import com.satelitenorte.sisget.model.FleetPositioningStatic;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FleetPositioningStaticIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setup() throws Exception {
        // Login to get token
        AuthRequest loginRequest = AuthRequest.builder()
                .matricula("5418")
                .senha("5418")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthResponse.class
        );
        this.token = authResponse.getToken();
    }

    @Test
    void testCRUDPositioningStatic() throws Exception {
        // 1. Create (POST)
        // Note: FleetPositioningStatic class will be created in next step, 
        // for now this test will fail compilation but describes intent.
        
        // This is a placeholder for the actual object creation once the class exists.
        // We will use a Map or JSON string directly to avoid compilation errors during initial red phase
        // if we were running a real CI, but here I'll write the code as I want it to be.
        
        String json = """
            {
                "vehicleId": "19010",
                "base": "BEL",
                "category": "RESERVA"
            }
        """;

        MvcResult result = mockMvc.perform(post("/api/fleet/static-pos")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleId").value("19010"))
                .andExpect(jsonPath("$.category").value("RESERVA"))
                .andReturn();

        // 2. List (GET)
        mockMvc.perform(get("/api/fleet/static-pos")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vehicleId").value("19010"));

        // 3. Specialized Fretamento (POST)
        String fretamentoJson = """
            {
                "vehicleId": "24001",
                "base": "IMP",
                "category": "FRETAMENTO",
                "endDate": "2026-05-10",
                "notes": "Fretamento para mineradora"
            }
        """;

        mockMvc.perform(post("/api/fleet/static-pos")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(fretamentoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Fretamento para mineradora"));
    }
}
