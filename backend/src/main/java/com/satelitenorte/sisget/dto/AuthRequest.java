package com.satelitenorte.sisget.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthRequest {
    private String matricula;
    private String senha;

    public AuthRequest() {}

    public AuthRequest(String matricula, String senha) {
        this.matricula = matricula;
        this.senha = senha;
    }

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public static AuthRequestBuilder builder() {
        return new AuthRequestBuilder();
    }

    public static class AuthRequestBuilder {
        private String matricula;
        private String senha;
        public AuthRequestBuilder matricula(String matricula) { this.matricula = matricula; return this; }
        public AuthRequestBuilder senha(String senha) { this.senha = senha; return this; }
        public AuthRequest build() { return new AuthRequest(matricula, senha); }
    }
}
