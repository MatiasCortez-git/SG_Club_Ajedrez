package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DeudaAlumnoDTO {
    private String nombreCompleto;
    private String dni;
    private BigDecimal montoAdeudado;
}