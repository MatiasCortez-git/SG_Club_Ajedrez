package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;

public interface CuotaService {

    /**
     * Calcula el monto total a pagar por un alumno en el mes actual.
     * * @param idAlumno ID del alumno
     * @return El monto final de la cuota
     */
	CuotaCalculoResponseDTO calcularCuotaMensual(Integer idAlumno);
	
	void generarYGuardarCuotaMensual(Integer idAlumno, String periodo);

}