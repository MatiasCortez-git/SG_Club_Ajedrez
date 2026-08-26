package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.ProfesorCreateDTO;
import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import com.clubajedrez.backend.services.ProfesorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<ProfesorResponseDTO> crearProfesor(@RequestBody ProfesorCreateDTO dto) {
        return new ResponseEntity<>(profesorService.crearProfesor(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesorResponseDTO> actualizarProfesor(@PathVariable Integer id, @RequestBody ProfesorCreateDTO dto) {
        return ResponseEntity.ok(profesorService.actualizarProfesor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProfesor(@PathVariable Integer id) {
        profesorService.eliminarProfesor(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}