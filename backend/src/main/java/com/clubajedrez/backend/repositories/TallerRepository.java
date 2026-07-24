package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Taller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TallerRepository extends JpaRepository<Taller, Integer> {
}