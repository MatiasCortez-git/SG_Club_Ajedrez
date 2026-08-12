package com.clubajedrez.backend.services;

public interface CuotaService {

    /**
     * Calcula el monto total a pagar por un alumno en el mes actual.
     * * @param idAlumno ID del alumno
     * @return El monto final de la cuota
     */
    Double calcularCuotaMensual(Integer idAlumno);

}