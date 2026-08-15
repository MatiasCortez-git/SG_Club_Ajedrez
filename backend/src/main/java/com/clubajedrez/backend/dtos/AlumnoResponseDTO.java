package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AlumnoResponseDTO {
    private Integer idPersona; 
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
    
    // Opcional, pero muy útil para el Frontend:
    private boolean isFederado; 
}