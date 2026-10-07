package com.clubajedrez.backend.dtos;
import lombok.Data;

@Data
public class PerfilResponseDTO {
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}