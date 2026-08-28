package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.ComprobanteDTO;
import com.clubajedrez.backend.dtos.PagoCreateDTO;
import com.clubajedrez.backend.dtos.PagoResponseDTO;

public interface PagoService {
    PagoResponseDTO registrarPago(PagoCreateDTO dto);
    
 // NUEVO MÉTODO TICKET COMPROBANTES
    ComprobanteDTO obtenerComprobantePorId(Integer idPago);
}