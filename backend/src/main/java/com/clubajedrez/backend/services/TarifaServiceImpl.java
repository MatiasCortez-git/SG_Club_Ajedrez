package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.TarifaGlobalDTO;
import com.clubajedrez.backend.entities.TarifaGlobal;
import com.clubajedrez.backend.exceptions.TarifaNoEncontradaException;
import com.clubajedrez.backend.repositories.TarifaGlobalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarifaServiceImpl implements TarifaService {

    private final TarifaGlobalRepository tarifaRepository;

    public TarifaServiceImpl(TarifaGlobalRepository tarifaRepository) {
        this.tarifaRepository = tarifaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TarifaGlobalDTO> obtenerTarifas() {
        return tarifaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void actualizarTarifas(List<TarifaGlobalDTO> tarifasDTO) {
        for (TarifaGlobalDTO dto : tarifasDTO) {
            TarifaGlobal tarifa = tarifaRepository.findByConcepto(dto.getConcepto())
                    .orElseThrow(() -> new TarifaNoEncontradaException("No se encontró la tarifa con concepto: " + dto.getConcepto()));
            
            tarifa.setMontoActual(dto.getMontoActual());
            tarifaRepository.save(tarifa);
        }
    }

    private TarifaGlobalDTO mapToDTO(TarifaGlobal tarifa) {
        TarifaGlobalDTO dto = new TarifaGlobalDTO();
        dto.setConcepto(tarifa.getConcepto());
        dto.setMontoActual(tarifa.getMontoActual());
        return dto;
    }
}