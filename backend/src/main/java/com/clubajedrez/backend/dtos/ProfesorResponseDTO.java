package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class ProfesorResponseDTO {
    private Integer idPersona; 
    private String nombre;
    private String apellido;
}