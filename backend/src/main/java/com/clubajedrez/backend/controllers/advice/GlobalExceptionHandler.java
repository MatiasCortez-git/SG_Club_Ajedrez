package com.clubajedrez.backend.controllers.advice;

import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
// (Aquí también deberías importar tu TallerNoEncontradoException)
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Maneja cualquier excepción de tipo "No Encontrado" (404)
    @ExceptionHandler({AlumnoNoEncontradoException.class , TallerNoEncontradoException.class })
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Recurso no encontrado");
        response.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // Maneja excepciones de reglas de negocio / validaciones (400)
    @ExceptionHandler(TallerSinCupoException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(TallerSinCupoException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Regla de negocio violada");
        response.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // o HttpStatus.CONFLICT
    }
}