package com.clubajedrez.backend.services;

public interface TallerService {
    
    /**
     * Inscribe un alumno en un taller específico.
     * Lanzará TallerSinCupoException si no hay lugar,
     * o AlumnoNoEncontradoException si el alumno no existe.
     * * @param idAlumno ID del alumno a inscribir
     * @param idTaller ID del taller
     */
    void inscribirAlumno(Integer idAlumno, Integer idTaller);

}