package com.clubajedrez.backend.repositories;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clubajedrez.backend.entities.HistorialIa;

@Repository
public interface HistorialIaRepository extends JpaRepository<HistorialIa, Long> {
    long countByUsernameAndFechaConsultaAfter(String username, LocalDateTime inicioDia);
}