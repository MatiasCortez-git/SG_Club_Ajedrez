package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.TarifaGlobalDTO;
import java.util.List;

public interface TarifaService {
    List<TarifaGlobalDTO> obtenerTarifas();
    void actualizarTarifas(List<TarifaGlobalDTO> tarifasDTO);
}