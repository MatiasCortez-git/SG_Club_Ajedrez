package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PersonaNoEncontradaException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
    public PersonaNoEncontradaException(String mensaje) {
        super(mensaje);
    }
}