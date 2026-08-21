package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class CuotaGenerateDTO {
    private Integer idAlumno;
    private String periodo; // Ej: "2026-09"
}