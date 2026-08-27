package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

import com.clubajedrez.backend.dtos.ProfesorCreateDTO;
import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import com.clubajedrez.backend.entities.Profesor;
import com.clubajedrez.backend.exceptions.ProfesorNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoFederadoException;
import com.clubajedrez.backend.repositories.ProfesorRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;

@Service
public class ProfesorServiceImpl implements ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final FederadoRepository federadoRepository;

    // Inyección obligatoria por constructor
    public ProfesorServiceImpl(ProfesorRepository profesorRepository, FederadoRepository federadoRepository) {
        this.profesorRepository = profesorRepository;
        this.federadoRepository = federadoRepository;
    }

    @Override
    public List<ProfesorResponseDTO> obtenerTodos() {
        // Buscamos todos los profesores en PostgreSQL y los mapeamos a DTO
        return profesorRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ProfesorResponseDTO crearProfesor(ProfesorCreateDTO dto) {
        // REGLA DE NEGOCIO: Validar estrictamente que sea federado
        if (dto.getCodFederacion() == null || dto.getCodFederacion().trim().isEmpty()) {
            throw new ProfesorNoFederadoException("Todo profesor debe ser un jugador federado. Código faltante.");
        }

        // 1. Crear el profesor (Esto inserta en Persona y en Profesor)
        Profesor profesor = new Profesor();
        profesor.setNombre(dto.getNombre());
        profesor.setApellido(dto.getApellido());
        profesor.setDni(dto.getDni());
        profesor.setEmail(dto.getEmail());
        profesor.setTelefono(dto.getTelefono());

        Profesor profGuardado = profesorRepository.save(profesor);

        // 2. Inyectar el rol de Federado a esta misma persona usando la Query Nativa
        federadoRepository.registrarRolFederado(profGuardado.getIdPersona(), dto.getCodFederacion(), dto.getElo());

        return mapToDTO(profGuardado);
    }

    @Override
    @Transactional
    public ProfesorResponseDTO actualizarProfesor(Integer id, ProfesorCreateDTO dto) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNoEncontradoException("No se encontró ningún profesor con el ID: " + id));

        profesor.setNombre(dto.getNombre());
        profesor.setApellido(dto.getApellido());
        profesor.setTelefono(dto.getTelefono());
        profesor.setEmail(dto.getEmail());
        
     // PARCHE: Actualizamos la tabla Federado usando la query nativa
        federadoRepository.actualizarRolFederado(id, dto.getCodFederacion(), dto.getElo());
        
        // Al actualizar, JPA guarda los cambios automáticamente por la anotación @Transactional
        return mapToDTO(profesor);
    }

    @Override
    @Transactional
    public void eliminarProfesor(Integer id) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNoEncontradoException("No se encontró ningún profesor con el ID: " + id));
                
        // BAJA LÓGICA: Cambiamos el estado en lugar de hacer DELETE
        profesor.setIsActive(false); 
        profesorRepository.save(profesor);
    }

    /// Método helper privado para el mapeo
    private ProfesorResponseDTO mapToDTO(Profesor profesor) {
        ProfesorResponseDTO dto = new ProfesorResponseDTO();
        
        dto.setIdPersona(profesor.getIdPersona());
        dto.setNombre(profesor.getNombre());
        dto.setApellido(profesor.getApellido());
        dto.setEmail(profesor.getEmail());
        dto.setTelefono(profesor.getTelefono());
        dto.setDni(profesor.getDni());
        
     // Consultas directas a PostgreSQL esquivando la caché
        String codFed = federadoRepository.obtenerCodFederacion(profesor.getIdPersona());
        Integer elo = federadoRepository.obtenerElo(profesor.getIdPersona());
        
        dto.setCodFederacion(codFed);
        dto.setElo(elo);
        return dto;
    }
}