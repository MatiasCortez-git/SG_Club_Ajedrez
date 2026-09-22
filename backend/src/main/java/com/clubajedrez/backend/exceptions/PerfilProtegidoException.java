package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class PerfilProtegidoException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
    public PerfilProtegidoException(String mensaje) {
        super(mensaje);
    }
}