package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.TarifaGlobal;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarifaGlobalRepository extends JpaRepository<TarifaGlobal, Integer> {
	// Spring crea el SQL: SELECT * FROM tarifa_global WHERE concepto = ?
    Optional<TarifaGlobal> findByConcepto(String concepto);
}