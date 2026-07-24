package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.AlumnoTallerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumnoTallerRepository extends JpaRepository<AlumnoTaller, AlumnoTallerId> {
}