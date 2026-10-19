package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EstadisticaRecaudacionDTO {
    private String periodo;
    private BigDecimal ingresosCobrados;
    private BigDecimal capitalRetenido;
    private Long cuotasPagadas;
    private Long cuotasPendientes;
    private Double tasaCobro;
}