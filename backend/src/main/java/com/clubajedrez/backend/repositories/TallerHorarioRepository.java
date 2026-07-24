package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.TallerHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TallerHorarioRepository extends JpaRepository<TallerHorario, Integer> {
}