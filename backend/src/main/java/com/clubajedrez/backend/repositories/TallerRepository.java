package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Taller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TallerRepository extends JpaRepository<Taller, Integer> {
	
	// Trae todos los talleres activos
    List<Taller> findByIsActiveTrue();
    
    // Busca un taller por ID solo si está activo
    Optional<Taller> findByIdTallerAndIsActiveTrue(Integer idTaller);
	
}