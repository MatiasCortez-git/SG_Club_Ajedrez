package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class ProfesorResponseDTO {
    private Integer idPersona; 
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String codFederacion;
    
    private String dni;
    private Integer elo;
}