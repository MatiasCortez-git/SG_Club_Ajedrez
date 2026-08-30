package com.clubajedrez.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CuotaDuplicadaException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public CuotaDuplicadaException(String message) {
        super(message);
    }
}