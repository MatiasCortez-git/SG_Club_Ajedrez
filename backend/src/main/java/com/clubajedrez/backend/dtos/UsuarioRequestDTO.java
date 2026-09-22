package com.clubajedrez.backend.dtos;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
    private String username;
    private String password;
    private String rol;
    private Integer idPersona; // Agregado obligatorio por nuestra restricción
}
