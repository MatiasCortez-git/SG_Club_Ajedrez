package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TallerResponseDTO {
    private Integer idTaller; // El ID generado
    private String nombre;
    private Integer cupoMaximo;
    private String duracion;
    private BigDecimal costo;
    private String tipoNivel;
    private Integer idProfesor;
    
 // NUEVO ATRIBUTO (Ticket #18 - Ocupación de cupos)
    private Integer inscriptos;
}