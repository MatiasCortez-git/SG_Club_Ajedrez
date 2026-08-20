package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoResponseDTO {
    private Integer idPago;
    private LocalDateTime fechaPago;
    private BigDecimal montoTotal;
    private String medioPago;
}