package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.AlumnoCreateDTO;
import com.clubajedrez.backend.dtos.AlumnoResponseDTO;

public interface AlumnoService {

    AlumnoResponseDTO crearAlumno(AlumnoCreateDTO dto);

    AlumnoResponseDTO obtenerAlumnoPorId(Integer id);

    void inscribirEnTaller(Integer idAlumno, Integer idTaller);
    
    List<AlumnoResponseDTO> obtenerTodos();
}