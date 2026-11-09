package com.clubajedrez.backend.dtos;

public record AiChessResponseDTO(
    String informeMarkdown, // Acá va el análisis pedagógico O las pautas de la clase
    String contenidoPgn     // Acá van los 5 errores O los ejercicios de la base de datos
) {}