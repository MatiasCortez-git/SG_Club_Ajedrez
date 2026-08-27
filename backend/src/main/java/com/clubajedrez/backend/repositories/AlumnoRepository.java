package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Alumno;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {
		
	// Trae todos los activos
    List<Alumno> findByIsActiveTrue();
    
    // Busca por ID pero solo si está activo 
    Optional<Alumno> findByIdPersonaAndIsActiveTrue(Integer idPersona); 
    
    // Busca por DNI pero solo si está activo
    Optional<Alumno> findByDniAndIsActiveTrue(String dni);
	
}