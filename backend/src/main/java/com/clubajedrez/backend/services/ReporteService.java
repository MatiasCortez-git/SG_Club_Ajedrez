package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.DeudaAlumnoDTO;
import com.clubajedrez.backend.dtos.EstadisticaDemografiaDTO;
import com.clubajedrez.backend.dtos.EstadisticaOcupacionDTO;
import com.clubajedrez.backend.dtos.EstadisticaRecaudacionDTO;
import com.clubajedrez.backend.dtos.RankingEloDTO;
import java.util.List;

public interface ReporteService {
    List<RankingEloDTO> obtenerRankingElo();
    
    List<DeudaAlumnoDTO> obtenerAlumnosMorosos();
    
    public List<EstadisticaOcupacionDTO> obtenerEstadisticasOcupacion();
    byte[] generarCsvOcupacion();
    
    List<EstadisticaRecaudacionDTO> obtenerEstadisticasRecaudacion();
    byte[] generarCsvRecaudacion();
    
    List<EstadisticaDemografiaDTO> obtenerEstadisticasDemograficas();
    byte[] generarCsvDemografico();
}