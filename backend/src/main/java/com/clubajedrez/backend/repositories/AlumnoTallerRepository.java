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
	
	// NUEVO MeTODO: Le decimos a Spring "¡No adivines! Ejecuta este SQL exacto"
    @Query(value = "SELECT COUNT(*) " +
                   "FROM Alumno_Taller " +
                   "WHERE id_taller = :idTaller " +
                   "AND fecha_inscripcion >= :inicio " +
                   "AND fecha_inscripcion <= :fin", 
           nativeQuery = true)
    long contarInscriptosEnPeriodo(@Param("idTaller") Integer idTaller, 
                                   @Param("inicio") java.time.LocalDateTime inicio, 
                                   @Param("fin") java.time.LocalDateTime fin);
	
    
    // NUEVO MeTODO: Ejecuta SQL directamente en PostgreSQL
    @Query(value = "SELECT COALESCE(SUM(precio_acordado), 0) " +
                   "FROM Alumno_Taller " +
                   "WHERE id_alumno = :idAlumno " +
                   "AND EXTRACT(YEAR FROM fecha_inscripcion) = EXTRACT(YEAR FROM CURRENT_DATE)", 
           nativeQuery = true)
    Double sumarTalleresVigentes(@Param("idAlumno") Integer idAlumno);
    
 // NUEVO MÉTODO TICKET COMPROBANTES
    List<AlumnoTaller> findByAlumno_IdPersona(Integer idPersona);

}