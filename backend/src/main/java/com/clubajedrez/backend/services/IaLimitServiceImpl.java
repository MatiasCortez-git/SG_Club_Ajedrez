package com.clubajedrez.backend.services;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.clubajedrez.backend.entities.HistorialIa;
import com.clubajedrez.backend.repositories.HistorialIaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class IaLimitServiceImpl implements IaLimitService{

    private final HistorialIaRepository historialRepository;

    public IaLimitServiceImpl(HistorialIaRepository historialRepository) {
        this.historialRepository = historialRepository;
    }

    public void validarYRegistrarUso(String username) {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        long consultasHoy = historialRepository.countByUsernameAndFechaConsultaAfter(username, inicioDia);

        if (consultasHoy >= 5) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Límite de 5 consultas diarias de IA alcanzado.");
        }
        
        HistorialIa nuevoRegistro = new HistorialIa(username, LocalDateTime.now());
        historialRepository.save(nuevoRegistro);
    }
}