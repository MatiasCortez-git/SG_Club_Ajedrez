package com.clubajedrez.backend.controllers;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.clubajedrez.backend.dtos.AiChessResponseDTO;
import com.clubajedrez.backend.dtos.PlanificadorRequestDTO;
import com.clubajedrez.backend.services.AiChessService;
import com.clubajedrez.backend.services.IaLimitService;

@RestController
@RequestMapping("/api/v1/ia")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROFESOR')")
public class IaController {


	private final AiChessService aiService;
    private final IaLimitService limitService;

    public IaController(@Qualifier("geminiChessService") AiChessService aiService, IaLimitService limitService) {
        this.aiService = aiService;
        this.limitService = limitService;
    }

    @PostMapping(value = "/analizar-pgn", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiChessResponseDTO> analizarPartidas(
            @RequestParam("file") MultipartFile file,
            @RequestParam("idAlumno") Integer idAlumno,
            Principal principal) {
        
        //limitService.validarYRegistrarUso(principal.getName());
    	AiChessResponseDTO respuesta = aiService.analizarPgn(file, idAlumno);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping(value = "/planificador")
    public ResponseEntity<AiChessResponseDTO> generarClase(
            @RequestBody PlanificadorRequestDTO request,
            Principal principal
            ) {
            
 //       limitService.validarYRegistrarUso(principal.getName());
    	AiChessResponseDTO respuesta = aiService.generarEjercicios(request);
        return ResponseEntity.ok(respuesta);
    }
}