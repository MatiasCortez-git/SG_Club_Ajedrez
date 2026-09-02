package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.AlumnoCreateDTO;
import com.clubajedrez.backend.dtos.AlumnoResponseDTO;
import com.clubajedrez.backend.services.AlumnoService;
import com.clubajedrez.backend.services.TallerService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alumnos")
public class AlumnoController {

    private final AlumnoService alumnoService;
    private final TallerService tallerService;

    public AlumnoController(AlumnoService alumnoService,TallerService tallerService) {
        this.alumnoService = alumnoService;
        this.tallerService = tallerService;
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
        
        tallerService.inscribirAlumno(idAlumno, idTaller);
        
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
    
    // 6. Actualizar alumno	
    @PutMapping("/{id}")
    public ResponseEntity<AlumnoResponseDTO> actualizarAlumno(@PathVariable Integer id, @RequestBody AlumnoCreateDTO dto) {
        return ResponseEntity.ok(alumnoService.actualizarAlumno(id, dto));
    }

    // 7. Eliminar    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAlumno(@PathVariable Integer id) {
        alumnoService.eliminarAlumno(id);
        return ResponseEntity.noContent().build();
    }
    
    // 8. Eliminar alumno de un taller
    @DeleteMapping("/{idAlumno}/talleres/{idTaller}")
    public ResponseEntity<Void> desinscribirAlumno(@PathVariable Integer idAlumno, @PathVariable Integer idTaller) {
        tallerService.desinscribirAlumno(idAlumno, idTaller);
        return ResponseEntity.noContent().build();
    }
    
}