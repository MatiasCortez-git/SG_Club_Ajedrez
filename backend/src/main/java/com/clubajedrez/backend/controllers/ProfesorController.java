package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import com.clubajedrez.backend.services.ProfesorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profesores")
public class ProfesorController {

    private final ProfesorService profesorService;

    public ProfesorController(ProfesorService profesorService) {
        this.profesorService = profesorService;
    }

    @GetMapping
    public ResponseEntity<List<ProfesorResponseDTO>> obtenerTodos() {
        List<ProfesorResponseDTO> profesores = profesorService.obtenerTodos();
        return ResponseEntity.ok(profesores); // Devuelve 200 OK con la lista
    }
}