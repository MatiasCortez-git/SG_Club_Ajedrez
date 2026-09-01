package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class RankingEloDTO {
    private String nombreCompleto;
    private String dni;
    private String codFederacion;
    private Integer elo;
}