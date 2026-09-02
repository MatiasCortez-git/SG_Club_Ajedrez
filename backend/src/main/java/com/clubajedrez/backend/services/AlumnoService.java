package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.AlumnoCreateDTO;
import com.clubajedrez.backend.dtos.AlumnoResponseDTO;

public interface AlumnoService {

    AlumnoResponseDTO crearAlumno(AlumnoCreateDTO dto);

    AlumnoResponseDTO obtenerAlumnoPorId(Integer id);
    
    List<AlumnoResponseDTO> obtenerTodos();
    
    AlumnoResponseDTO obtenerPorDni(String dni);
    
 // NUEVOS MÉTODOS TICKET 17
    AlumnoResponseDTO actualizarAlumno(Integer id, AlumnoCreateDTO dto);
    
    void eliminarAlumno(Integer id);
}