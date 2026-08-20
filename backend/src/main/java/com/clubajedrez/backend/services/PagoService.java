package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.PagoCreateDTO;
import com.clubajedrez.backend.dtos.PagoResponseDTO;

public interface PagoService {
    PagoResponseDTO registrarPago(PagoCreateDTO dto);
}