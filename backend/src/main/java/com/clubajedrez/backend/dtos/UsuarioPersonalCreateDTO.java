package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class UsuarioPersonalCreateDTO {
    // Datos de identidad
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    
    // Dato de acceso
    private String username;
 
}