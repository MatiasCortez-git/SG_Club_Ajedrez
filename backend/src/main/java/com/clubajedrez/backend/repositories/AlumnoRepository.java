package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Alumno;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Integer> {
	
	Optional<Alumno> findByDni(String dni);
	
}