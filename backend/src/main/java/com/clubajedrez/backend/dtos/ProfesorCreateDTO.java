package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class ProfesorCreateDTO {
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    
    // Datos obligatorios por regla de negocio
    private String codFederacion; 
    private Integer elo; 
}