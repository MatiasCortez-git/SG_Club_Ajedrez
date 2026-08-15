package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AlumnoCreateDTO {
    // Datos de Persona
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    
    // Datos específicos de Alumno
    private LocalDate fechaNacimiento;
}