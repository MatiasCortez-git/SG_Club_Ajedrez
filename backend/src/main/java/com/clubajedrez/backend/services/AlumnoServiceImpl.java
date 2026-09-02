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
    
    // Inyección por constructor
    public AlumnoServiceImpl(AlumnoRepository alumnoRepository, 
                             FederadoRepository federadoRepository) {
        this.alumnoRepository = alumnoRepository;
        this.federadoRepository = federadoRepository;
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

        // REGLA DE NEGOCIO: Federación Dinámica
        if (dto.getCodFederacion() != null && !dto.getCodFederacion().trim().isEmpty()) {
            if (federadoRepository.existsById(alumnoGuardado.getIdPersona())) {
                // Si ya era federado, actualizamos sus datos nativamente
                federadoRepository.actualizarRolFederado(alumnoGuardado.getIdPersona(), dto.getCodFederacion(), dto.getElo());
            } else {
                // Si era recreativo y ahora trae código, lo insertamos nativamente
                federadoRepository.registrarRolFederado(alumnoGuardado.getIdPersona(), dto.getCodFederacion(), dto.getElo());
            }
        } else {
            // Si el frontend no manda código, le quitamos el rol por si antes lo tenía
            federadoRepository.eliminarRolFederado(alumnoGuardado.getIdPersona());
        }
        
        // 3. Devolvemos el ResponseDTO
        return mapToDTO(alumnoGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoResponseDTO obtenerAlumnoPorId(Integer id) {
        Alumno alumno = alumnoRepository.findByIdPersonaAndIsActiveTrue(id)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No existe el alumno con ID: " + id));
        
        return mapToDTO(alumno);
    }

   
    
    @Override
    @Transactional(readOnly = true)
    public List<AlumnoResponseDTO> obtenerTodos() {
        // Buscamos todos los alumnos en la BD y los convertimos a DTO
        return alumnoRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public AlumnoResponseDTO obtenerPorDni(String dni) {
        // Buscamos al alumno usando el método nuevo en el repositorio
        Alumno alumno = alumnoRepository.findByDniAndIsActiveTrue(dni)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No se encontró ningún alumno con el DNI: " + dni));
        
        // Convertimos la Entidad a DTO para enviarlo al frontend
        return mapToDTO(alumno);
    }
    
    @Override
    @Transactional
    public AlumnoResponseDTO actualizarAlumno(Integer id, AlumnoCreateDTO dto) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No se encontró ningún alumno con el ID: " + id));

        // 1. Actualizar datos base heredados de Persona y propios de Alumno
        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setDni(dto.getDni());
        alumno.setEmail(dto.getEmail());
        alumno.setTelefono(dto.getTelefono());
        alumno.setFechaNacimiento(dto.getFechaNacimiento());
        
        // 2. REGLA DE NEGOCIO: Federación Dinámica
        if (dto.getCodFederacion() != null && !dto.getCodFederacion().trim().isEmpty()) {
            if (federadoRepository.existsById(id)) {
                // Si ya era federado, actualizamos sus datos nativamente
                federadoRepository.actualizarRolFederado(id, dto.getCodFederacion(), dto.getElo());
            } else {
                // Si era recreativo y ahora trae código, lo insertamos nativamente
                // Asumo que tenés este método registrarRolFederado de cuando hiciste Profesor
                federadoRepository.registrarRolFederado(id, dto.getCodFederacion(), dto.getElo());
            }
        } else {
            // Si el frontend no manda código, le quitamos el rol por si antes lo tenía
            federadoRepository.eliminarRolFederado(id);
        }

        // JPA guarda los cambios de 'alumno' automáticamente por el @Transactional
        return mapToDTO(alumno);
    }

    @Override
    @Transactional
    public void eliminarAlumno(Integer id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No se encontró ningún alumno con el ID: " + id));
        
        // Baja lógica: apagamos el registro sin borrarlo físicamente
        alumno.setIsActive(false); 
        alumnoRepository.save(alumno);
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
        
        // para extraer los datos evadiendo el conflicto de caché de herencia de Hibernate.
        String codFed = federadoRepository.obtenerCodFederacion(alumno.getIdPersona());
        Integer elo = federadoRepository.obtenerElo(alumno.getIdPersona());
        
        dto.setCodFederacion(codFed);
        dto.setElo(elo);
        return dto;
    }
}