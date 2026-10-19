package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.DeudaAlumnoDTO;
import com.clubajedrez.backend.dtos.EstadisticaDemografiaDTO;
import com.clubajedrez.backend.dtos.EstadisticaOcupacionDTO;
import com.clubajedrez.backend.dtos.EstadisticaRecaudacionDTO;
import com.clubajedrez.backend.dtos.RankingEloDTO;
import com.clubajedrez.backend.services.ReporteService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/ocupacion")
    public ResponseEntity<List<EstadisticaOcupacionDTO>> obtenerEstadisticasOcupacion() {
        return ResponseEntity.ok(reporteService.obtenerEstadisticasOcupacion());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/ocupacion/csv")
    public ResponseEntity<byte[]> descargarCsvOcupacion() {
        // El controlador delega el trabajo pesado al servicio
        byte[] csvBytes = reporteService.generarCsvOcupacion();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=estadisticas_ocupacion.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/recaudacion")
    public ResponseEntity<List<EstadisticaRecaudacionDTO>> obtenerEstadisticasRecaudacion() {
        return ResponseEntity.ok(reporteService.obtenerEstadisticasRecaudacion());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/recaudacion/csv")
    public ResponseEntity<byte[]> descargarCsvRecaudacion() {
        byte[] csvBytes = reporteService.generarCsvRecaudacion();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=estadisticas_recaudacion.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/demografia")
    public ResponseEntity<List<EstadisticaDemografiaDTO>> obtenerEstadisticasDemograficas() {
        return ResponseEntity.ok(reporteService.obtenerEstadisticasDemograficas());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/estadisticas/demografia/csv")
    public ResponseEntity<byte[]> descargarCsvDemografico() {
        byte[] csvBytes = reporteService.generarCsvDemografico();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=estadisticas_demografia.csv")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
    
}