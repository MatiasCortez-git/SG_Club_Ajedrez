package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class CuentaInactivaException extends RuntimeException {
    
	private static final long serialVersionUID = 1L;
	public CuentaInactivaException(String mensaje) {
        super(mensaje);
    }
}