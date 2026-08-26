package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.ProfesorCreateDTO;
import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import java.util.List;

public interface ProfesorService {
    List<ProfesorResponseDTO> obtenerTodos();
    
    // NUEVOS MÉTODOS TICKET 16
    ProfesorResponseDTO crearProfesor(ProfesorCreateDTO dto);
    ProfesorResponseDTO actualizarProfesor(Integer id, ProfesorCreateDTO dto);
    void eliminarProfesor(Integer id); // Baja lógica
}