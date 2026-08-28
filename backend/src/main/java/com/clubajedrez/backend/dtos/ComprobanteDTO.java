package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ComprobanteDTO {
    private Integer idPago;
    private LocalDateTime fechaPago;
    private BigDecimal montoTotal;
    private String medioPago;
    private String nombreAlumno;
    private List<String> periodosAbonados;
    private List<String> talleres;
    private BigDecimal montoSocio;
    private BigDecimal montoFederado;
    
    
}