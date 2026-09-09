package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // Spring devuelve 409 automáticamente
public class InscripcionDuplicadaException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public InscripcionDuplicadaException(String mensaje) {
        super(mensaje);
    }
}