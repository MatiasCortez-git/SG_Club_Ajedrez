package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PgnInvalidoException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
    public PgnInvalidoException(String message) {
        super(message);
    }
}