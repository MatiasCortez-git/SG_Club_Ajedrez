package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.DeudaAlumnoDTO;
import com.clubajedrez.backend.dtos.RankingEloDTO;
import com.clubajedrez.backend.services.ReporteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingEloDTO>> obtenerRanking() {
        List<RankingEloDTO> ranking = reporteService.obtenerRankingElo();
        return ResponseEntity.ok(ranking);
    }
    
    @GetMapping("/morosos")
    public ResponseEntity<List<DeudaAlumnoDTO>> obtenerMorosos() {
        List<DeudaAlumnoDTO> morosos = reporteService.obtenerAlumnosMorosos();
        return ResponseEntity.ok(morosos);
    }
    
}