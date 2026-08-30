package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.AlumnoTallerId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumnoTallerRepository extends JpaRepository<AlumnoTaller, AlumnoTallerId> {
	
	long countByTaller_IdTaller(Integer idTaller);
    
	// Lógica limpia: Como la tabla solo tiene alumnos activos, sumamos todo directamente
    @Query(value = "SELECT COALESCE(SUM(precio_acordado), 0) " +
                   "FROM Alumno_Taller " +
                   "WHERE id_alumno = :idAlumno", 
           nativeQuery = true)
    Double sumarTalleresVigentes(@Param("idAlumno") Integer idAlumno);
	    
 // NUEVO MÉTODO TICKET COMPROBANTES
    List<AlumnoTaller> findByAlumno_IdPersona(Integer idPersona);

}