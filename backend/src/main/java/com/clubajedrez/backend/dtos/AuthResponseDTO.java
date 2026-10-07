package com.clubajedrez.backend.dtos;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String jwt;
    private String rol;
    private boolean debe_cambiar_password;
}