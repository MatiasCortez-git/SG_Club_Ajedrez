package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ServicioIAException extends RuntimeException {
    
	private static final long serialVersionUID = 1L;
	public ServicioIAException(String message) {
        super(message);
    }
}