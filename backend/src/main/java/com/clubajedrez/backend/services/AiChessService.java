package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.AiChessResponseDTO;
import com.clubajedrez.backend.dtos.PlanificadorRequestDTO;

import org.springframework.web.multipart.MultipartFile;

public interface AiChessService {
    
	AiChessResponseDTO analizarPgn(MultipartFile file, Integer alumnoId);
    
    AiChessResponseDTO generarEjercicios(PlanificadorRequestDTO dto);
}
