package com.satelitenorte.sisget.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthResponse {
    private String token;
    private String nome;
    private String matricula;
    private String cargo;

    public AuthResponse() {}

    public AuthResponse(String token, String nome, String matricula, String cargo) {
        this.token = token;
        this.nome = nome;
        this.matricula = matricula;
        this.cargo = cargo;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String nome;
        private String matricula;
        private String cargo;
        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder nome(String nome) { this.nome = nome; return this; }
        public AuthResponseBuilder matricula(String matricula) { this.matricula = matricula; return this; }
        public AuthResponseBuilder cargo(String cargo) { this.cargo = cargo; return this; }
        public AuthResponse build() { return new AuthResponse(token, nome, matricula, cargo); }
    }
}
