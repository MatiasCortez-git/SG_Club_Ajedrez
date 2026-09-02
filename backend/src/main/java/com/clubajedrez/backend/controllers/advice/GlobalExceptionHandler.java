package com.clubajedrez.backend.controllers.advice;

import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.CuotaDuplicadaException;
import com.clubajedrez.backend.exceptions.CuotaYaPagadaException;
import com.clubajedrez.backend.exceptions.PagoNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoFederadoException;
import com.clubajedrez.backend.exceptions.TallerNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
import com.clubajedrez.backend.exceptions.TarifaNoEncontradaException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Maneja cualquier excepción de tipo "No Encontrado" (404)
    @ExceptionHandler({AlumnoNoEncontradoException.class , 
    				   TallerNoEncontradoException.class, 
    				   ProfesorNoEncontradoException.class,
    				   PagoNoEncontradoException.class, 
    				   TarifaNoEncontradaException.class})
    
    
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Recurso no encontrado");
        response.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // Maneja excepciones de reglas de negocio / validaciones (400)
    @ExceptionHandler({TallerSinCupoException.class, 
    				   ProfesorNoFederadoException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Regla de negocio violada");
        response.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // o HttpStatus.CONFLICT
    }
    
    // Maneja cualquier excepción de tipo "conflicto" (409)
    @ExceptionHandler({CuotaYaPagadaException.class, CuotaDuplicadaException.class})
    public ResponseEntity<Map<String, String>> handleConflictosDeNegocio(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Conflicto de Regla de Negocio");
        response.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}