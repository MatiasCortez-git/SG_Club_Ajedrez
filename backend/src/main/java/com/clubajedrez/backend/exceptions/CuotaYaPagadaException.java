package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // Devolvemos 409 Conflict si hay choque de estados
public class CuotaYaPagadaException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public CuotaYaPagadaException(String mensaje) {
        super(mensaje);
    }
}