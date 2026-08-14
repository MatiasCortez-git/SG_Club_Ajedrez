package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TallerCreateDTO {
    private String nombre;
    private Integer cupoMaximo;
    private String duracion; 
    private BigDecimal costo;
    private String tipoNivel;
    private Integer idProfesor;
}