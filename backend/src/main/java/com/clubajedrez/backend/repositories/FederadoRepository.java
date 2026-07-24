package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Federado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FederadoRepository extends JpaRepository<Federado, Integer> {
}