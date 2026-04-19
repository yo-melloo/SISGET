package com.satelitenorte.sisget.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String senhaAntiga;
    private String novaSenha;
}
