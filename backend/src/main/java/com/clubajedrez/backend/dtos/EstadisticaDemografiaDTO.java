package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class EstadisticaDemografiaDTO {
    private String nivelTaller;
    private Long cantidadAlumnos;
    private Double edadPromedio;
    private Integer edadMinima;
    private Integer edadMaxima;
}