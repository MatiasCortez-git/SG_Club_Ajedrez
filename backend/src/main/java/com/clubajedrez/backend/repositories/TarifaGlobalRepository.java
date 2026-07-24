package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.TarifaGlobal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarifaGlobalRepository extends JpaRepository<TarifaGlobal, Integer> {
}