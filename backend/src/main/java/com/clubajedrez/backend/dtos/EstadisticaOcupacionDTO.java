package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EstadisticaOcupacionDTO {
    private String nombreTaller;
    private String nivel;
    private Integer cupoMaximo;
    private Long inscriptosReales;
    private Double porcentajeOcupacion;
    private BigDecimal rentabilidadProyectada;
}
