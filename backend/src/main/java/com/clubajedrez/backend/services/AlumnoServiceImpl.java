package com.clubajedrez.backend.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.AlumnoCreateDTO;
import com.clubajedrez.backend.dtos.AlumnoResponseDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;

@Service
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final FederadoRepository federadoRepository;
    private final TallerService tallerService; // Inyectamos el servicio para reutilizar la lógica de cupos

    // Inyección por constructor
    public AlumnoServiceImpl(AlumnoRepository alumnoRepository, 
                             FederadoRepository federadoRepository,
                             TallerService tallerService) {
        this.alumnoRepository = alumnoRepository;
        this.federadoRepository = federadoRepository;
        this.tallerService = tallerService;
    }

    @Override
    @Transactional
    public AlumnoResponseDTO crearAlumno(AlumnoCreateDTO dto) {
        // 1. Mapeo manual del DTO a la Entidad Alumno
        Alumno alumno = new Alumno();
        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setDni(dto.getDni());
        alumno.setEmail(dto.getEmail());
        alumno.setTelefono(dto.getTelefono());
        alumno.setFechaNacimiento(dto.getFechaNacimiento());

        // 2. Guardamos en BD. Hibernate gestionará el INSERT en las tablas 'persona' y 'alumno' automáticamente por el JOINED.
        Alumno alumnoGuardado = alumnoRepository.save(alumno);

        // Nota de Arquitectura: Si el DTO incluyera datos de federación según el "Proyecto Integrador", 
        // aquí instanciaríamos la entidad Federado y la guardaríamos con el federadoRepository usando el ID generado.

        // 3. Devolvemos el ResponseDTO
        return mapToDTO(alumnoGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoResponseDTO obtenerAlumnoPorId(Integer id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No existe el alumno con ID: " + id));
        
        return mapToDTO(alumno);
    }

    @Override
    @Transactional
    public void inscribirEnTaller(Integer idAlumno, Integer idTaller) {
        // Delegamos la tarea al TallerService que ya tiene programada la validación del cupo y el Trigger
        tallerService.inscribirAlumno(idAlumno, idTaller);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AlumnoResponseDTO> obtenerTodos() {
        // Buscamos todos los alumnos en la BD y los convertimos a DTO
        return alumnoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // MÉTODOS PRIVADOS DE MAPEO
    // =========================================================================

    private AlumnoResponseDTO mapToDTO(Alumno alumno) {
        AlumnoResponseDTO dto = new AlumnoResponseDTO();
        dto.setIdPersona(alumno.getIdPersona());
        dto.setNombre(alumno.getNombre());
        dto.setApellido(alumno.getApellido());
        dto.setDni(alumno.getDni());
        dto.setEmail(alumno.getEmail());
        dto.setTelefono(alumno.getTelefono());
        dto.setFechaNacimiento(alumno.getFechaNacimiento());
        
        // Verificamos si es federado consultando la base de datos de manera súper eficiente
        dto.setFederado(federadoRepository.existsById(alumno.getIdPersona()));
        
        return dto;
    }
}