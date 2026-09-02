package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.AlumnoResponseDTO;
import com.clubajedrez.backend.dtos.TallerCreateDTO;
import com.clubajedrez.backend.dtos.TallerResponseDTO;

public interface TallerService {
    
    /**
     * Inscribe un alumno en un taller específico.
     * Lanzará TallerSinCupoException si no hay lugar,
     * o AlumnoNoEncontradoException si el alumno no existe.
     * * @param idAlumno ID del alumno a inscribir
     * @param idTaller ID del taller
     */
    void inscribirAlumno(Integer idAlumno, Integer idTaller);
    
 // Nuevos métodos para el Ticket #5
    TallerResponseDTO crearTaller(TallerCreateDTO dto);
    TallerResponseDTO obtenerTallerPorId(Integer idTaller);
    
    List<TallerResponseDTO> obtenerTodos();
    
 // NUEVOS MÉTODOS TICKET 18
    TallerResponseDTO actualizarTaller(Integer id, TallerCreateDTO dto);
    
    void eliminarTaller(Integer id);
    
    void desinscribirAlumno(Integer idAlumno, Integer idTaller);
    void resetearCicloLectivo();
    List<AlumnoResponseDTO> obtenerAlumnosPorTaller(Integer idTaller);
    void resetearCicloLectivoPorTaller(Integer idTaller);
    
    

}