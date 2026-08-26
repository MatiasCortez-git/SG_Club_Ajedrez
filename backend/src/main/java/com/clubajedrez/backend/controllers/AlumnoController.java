package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.AlumnoCreateDTO;
import com.clubajedrez.backend.dtos.AlumnoResponseDTO;
import com.clubajedrez.backend.services.AlumnoService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alumnos")
public class AlumnoController {

    private final AlumnoService alumnoService;

    public AlumnoController(AlumnoService alumnoService) {
        this.alumnoService = alumnoService;
    }

    // 1. Crear Alumno
    @PostMapping
    public ResponseEntity<AlumnoResponseDTO> crearAlumno(@RequestBody AlumnoCreateDTO dto) {
        AlumnoResponseDTO nuevoAlumno = alumnoService.crearAlumno(dto);
        return new ResponseEntity<>(nuevoAlumno, HttpStatus.CREATED); // 201 Created
    }

    // 2. Obtener Alumno
    @GetMapping("/{id}")
    public ResponseEntity<AlumnoResponseDTO> obtenerAlumno(@PathVariable Integer id) {
        AlumnoResponseDTO alumno = alumnoService.obtenerAlumnoPorId(id);
        return ResponseEntity.ok(alumno); // 200 OK
    }

    // 3. Inscribir Alumno a Taller (Ruta anidada RESTful)
    @PostMapping("/{idAlumno}/talleres/{idTaller}")
    public ResponseEntity<Void> inscribirEnTaller(
            @PathVariable Integer idAlumno, 
            @PathVariable Integer idTaller) {
        
        alumnoService.inscribirEnTaller(idAlumno, idTaller);
        
        // Devolvemos 201 Created sin body, o podrías devolver un mensaje de éxito.
        return new ResponseEntity<>(HttpStatus.CREATED); 
    }
    
    // 4. Devolver todos los alumnos
    @GetMapping
    public ResponseEntity<List<AlumnoResponseDTO>> obtenerTodos() {
        List<AlumnoResponseDTO> alumnos = alumnoService.obtenerTodos();
        return ResponseEntity.ok(alumnos); // Devuelve 200 OK
    }
    
    // 5. Buscar alumno por DNI
    @GetMapping("/dni/{dni}")
    public ResponseEntity<AlumnoResponseDTO> obtenerPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(alumnoService.obtenerPorDni(dni));
    }
}