package com.clubajedrez.backend.exceptions;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class MotorAnalisisException extends RuntimeException {
    
	private static final long serialVersionUID = 1L;
	public MotorAnalisisException(String message) {
        super(message);
    }
}

