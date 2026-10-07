package com.clubajedrez.backend.dtos;
import lombok.Data;

@Data
public class CambioPasswordVoluntarioDTO {
    private String passwordActual;
    private String passwordNueva;
}