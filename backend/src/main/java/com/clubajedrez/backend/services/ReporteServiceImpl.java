package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.RankingEloDTO;
import com.clubajedrez.backend.entities.Federado;
import com.clubajedrez.backend.repositories.FederadoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    private final FederadoRepository federadoRepository;

    public ReporteServiceImpl(FederadoRepository federadoRepository) {
        this.federadoRepository = federadoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RankingEloDTO> obtenerRankingElo() {
        // Obtenemos los federados ya ordenados desde PostgreSQL
        List<Federado> federados = federadoRepository.findByIsActiveTrueOrderByEloDesc();
        
        return federados.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RankingEloDTO mapToDTO(Federado federado) {
        RankingEloDTO dto = new RankingEloDTO();
        
        // Atributos heredados de Persona
        dto.setNombreCompleto(federado.getNombre() + " " + federado.getApellido());
        dto.setDni(federado.getDni());
        
        // Atributos propios de Federado
        dto.setCodFederacion(federado.getCodFederacion());
        dto.setElo(federado.getElo());
        
        return dto;
    }
}