package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CuotaResponseDTO {
    private Integer idCuota;
    private Integer idAlumno;
    private String periodo;
    private LocalDate fechaVencimiento;
    private String estado;
    private BigDecimal montoTotal;
    private Integer idPago;
}