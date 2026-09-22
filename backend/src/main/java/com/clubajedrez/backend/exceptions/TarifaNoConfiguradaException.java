package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class TarifaNoConfiguradaException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
    public TarifaNoConfiguradaException(String mensaje) {
        super(mensaje);
    }
}