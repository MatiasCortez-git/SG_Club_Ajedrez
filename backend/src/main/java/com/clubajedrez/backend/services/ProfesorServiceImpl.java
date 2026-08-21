package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import com.clubajedrez.backend.entities.Profesor;
import com.clubajedrez.backend.repositories.ProfesorRepository;

@Service
public class ProfesorServiceImpl implements ProfesorService {

    private final ProfesorRepository profesorRepository; 

    // Inyección obligatoria por constructor
    public ProfesorServiceImpl(ProfesorRepository profesorRepository) {
        this.profesorRepository = profesorRepository;
    }

    @Override
    public List<ProfesorResponseDTO> obtenerTodos() {
        // Buscamos todos los profesores en PostgreSQL y los mapeamos a DTO
        return profesorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Método helper privado para el mapeo
    private ProfesorResponseDTO mapToDTO(Profesor profesor) {
        ProfesorResponseDTO dto = new ProfesorResponseDTO();
        dto.setIdPersona(profesor.getIdPersona()); // Dato disponible gracias a la herencia[cite: 1]
        dto.setNombre(profesor.getNombre());
        dto.setApellido(profesor.getApellido());
        return dto;
    }
}