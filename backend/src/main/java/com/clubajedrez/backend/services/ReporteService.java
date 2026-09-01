package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.RankingEloDTO;
import java.util.List;

public interface ReporteService {
    List<RankingEloDTO> obtenerRankingElo();
}