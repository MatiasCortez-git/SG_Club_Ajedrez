package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.ProfesorResponseDTO;
import java.util.List;

public interface ProfesorService {
    List<ProfesorResponseDTO> obtenerTodos();
}