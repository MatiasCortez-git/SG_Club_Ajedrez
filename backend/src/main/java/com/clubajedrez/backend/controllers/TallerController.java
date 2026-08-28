package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.TallerCreateDTO;
import com.clubajedrez.backend.dtos.TallerResponseDTO;
import com.clubajedrez.backend.services.TallerService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/talleres") // Estándar de versionado
public class TallerController {

    private final TallerService tallerService;

    // Inyección de dependencias por constructor (Best Practice)
    public TallerController(TallerService tallerService) {
        this.tallerService = tallerService;
    }

    // Endpoint 1: Crear Taller
    @PostMapping
    public ResponseEntity<TallerResponseDTO> crearTaller(@RequestBody TallerCreateDTO createDTO) {
        // El servicio debe encargarse de recibir el DTO, transformarlo a Entidad, guardarlo y devolver otro DTO
        TallerResponseDTO nuevoTaller = tallerService.crearTaller(createDTO);
        
        // Retornamos 201 Created junto con el objeto creado
        return new ResponseEntity<>(nuevoTaller, HttpStatus.CREATED);
    }

    // Endpoint 2: Obtener Taller por ID
    @GetMapping("/{id}")
    public ResponseEntity<TallerResponseDTO> obtenerTaller(@PathVariable Integer id) {
        TallerResponseDTO taller = tallerService.obtenerTallerPorId(id);
        
        // Retornamos 200 OK con los datos
        return ResponseEntity.ok(taller);
    }
    
    // Endpoint 3: Obtener lista Talleres
    @GetMapping
    public ResponseEntity<List<TallerResponseDTO>> obtenerTodos() {
        List<TallerResponseDTO> talleres = tallerService.obtenerTodos();
        return ResponseEntity.ok(talleres); // Devuelve 200 OK con la lista
    }
    
    // Endpoint 4: Actualizar un Taller por ID
    @PutMapping("/{id}")
    public ResponseEntity<TallerResponseDTO> actualizarTaller(@PathVariable Integer id, @RequestBody TallerCreateDTO dto) {
        return ResponseEntity.ok(tallerService.actualizarTaller(id, dto));
    }

    // Endpoint 5: Eliminar Taller
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTaller(@PathVariable Integer id) {
        tallerService.eliminarTaller(id);
        return ResponseEntity.noContent().build();
    }

}