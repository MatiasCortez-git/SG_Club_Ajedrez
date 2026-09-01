package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.DeudaAlumnoDTO;
import com.clubajedrez.backend.dtos.RankingEloDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.DetalleCuota;
import com.clubajedrez.backend.entities.Federado;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    private final FederadoRepository federadoRepository;
    private final CuotaRepository cuotaRepository;

    public ReporteServiceImpl(FederadoRepository federadoRepository,
    		CuotaRepository cuotaRepository) {
        this.federadoRepository = federadoRepository;
        this.cuotaRepository = cuotaRepository;
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
    
    @Override
    @Transactional(readOnly = true)
    public List<DeudaAlumnoDTO> obtenerAlumnosMorosos() {
        // 1. Traer todas las cuotas impagas
        List<Cuota> cuotasPendientes = cuotaRepository.findByEstado("Pendiente");

        // 2. Usar un mapa para agrupar las deudas por DNI
        Map<String, DeudaAlumnoDTO> mapaDeudas = new HashMap<>();

        for (Cuota cuota : cuotasPendientes) {
            Alumno alumno = cuota.getAlumno();
            String dni = alumno.getDni();

            // Sumar el total de ESTA cuota leyendo sus detalles inmutables
            BigDecimal totalCuota = cuota.getDetalles().stream()
                    .map(DetalleCuota::getMontoCongelado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 3. Agrupar: Si el alumno ya está en el mapa, le sumamos el monto. Si no, lo creamos.
            if (mapaDeudas.containsKey(dni)) {
                DeudaAlumnoDTO dtoExistente = mapaDeudas.get(dni);
                dtoExistente.setMontoAdeudado(dtoExistente.getMontoAdeudado().add(totalCuota));
            } else {
                DeudaAlumnoDTO nuevoDto = new DeudaAlumnoDTO();
                nuevoDto.setNombreCompleto(alumno.getNombre() + " " + alumno.getApellido());
                nuevoDto.setDni(dni);
                nuevoDto.setMontoAdeudado(totalCuota);
                mapaDeudas.put(dni, nuevoDto);
            }
        }

        // 4. Retornar los valores del mapa como una lista
        return new ArrayList<>(mapaDeudas.values());
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