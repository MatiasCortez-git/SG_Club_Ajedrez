package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;
import com.clubajedrez.backend.entities.Cuota;

public interface CuotaService {

    /**
     * Calcula el monto total a pagar por un alumno en el mes actual.
     * * @param idAlumno ID del alumno
     * @return El monto final de la cuota
     */
	CuotaCalculoResponseDTO calcularCuotaMensual(Integer idAlumno);
	
	void generarYGuardarCuotaMensual(Integer idAlumno, String periodo);
	
	List<Cuota> obtenerCuotasPorAlumno(Integer idAlumno);

}