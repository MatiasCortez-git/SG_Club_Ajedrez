package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Integer> {
}