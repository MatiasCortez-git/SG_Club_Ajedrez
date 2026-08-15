package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CuotaCalculoResponseDTO {
    private Integer idAlumno;
    private String nombreCompleto;
    private BigDecimal montoBase;
    private BigDecimal montoFederado;
    private BigDecimal montoTalleres;
    private BigDecimal totalPagar;
}