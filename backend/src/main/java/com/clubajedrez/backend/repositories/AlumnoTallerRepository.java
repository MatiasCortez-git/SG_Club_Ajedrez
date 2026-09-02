package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.AlumnoTallerId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
    
 // 1. Desinscripción individual (Borrado físico)
    @Modifying
    @Query(value = "DELETE FROM alumno_taller WHERE id_alumno = :idAlumno AND id_taller = :idTaller", nativeQuery = true)
    void eliminarInscripcion(@Param("idAlumno") Integer idAlumno, @Param("idTaller") Integer idTaller);

    // 2. Reset masivo del ciclo lectivo
    @Modifying
    @Query(value = "TRUNCATE TABLE alumno_taller", nativeQuery = true)
    void vaciarTodasLasAulas();

    // 3. Listado de alumnos sentados en el aula hoy
    @Query("SELECT at.alumno FROM AlumnoTaller at WHERE at.taller.idTaller = :idTaller")
    List<Alumno> findAlumnosByTallerId(@Param("idTaller") Integer idTaller);

 // Reset individual de un taller específico
    @Modifying
    @Query(value = "DELETE FROM alumno_taller WHERE id_taller = :idTaller", nativeQuery = true)
    void vaciarAulaPorTaller(@Param("idTaller") Integer idTaller);
    
}