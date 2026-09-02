package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TarifaGlobalDTO {
    private String concepto;
    private BigDecimal montoActual;
}