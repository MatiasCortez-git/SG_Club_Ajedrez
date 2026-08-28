package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Cuota;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Integer> {
	
	// NUEVO MÉTODO PARA EL PARCHE DEL TICKET 12
    List<Cuota> findByAlumno_IdPersona(Integer idAlumno);

    List<Cuota> findByPago_IdPago(Integer idPago);
}