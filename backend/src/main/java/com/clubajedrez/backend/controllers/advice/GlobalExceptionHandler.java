package com.clubajedrez.backend.controllers.advice;

import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.CuentaInactivaException;
import com.clubajedrez.backend.exceptions.CuotaDuplicadaException;
import com.clubajedrez.backend.exceptions.CuotaYaPagadaException;
import com.clubajedrez.backend.exceptions.InscripcionDuplicadaException;
import com.clubajedrez.backend.exceptions.PagoNoEncontradoException;
import com.clubajedrez.backend.exceptions.PerfilProtegidoException;
import com.clubajedrez.backend.exceptions.PersonaNoEncontradaException;
import com.clubajedrez.backend.exceptions.ProfesorNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoFederadoException;
import com.clubajedrez.backend.exceptions.TallerNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
import com.clubajedrez.backend.exceptions.TarifaNoConfiguradaException;
import com.clubajedrez.backend.exceptions.TarifaNoEncontradaException;
import com.clubajedrez.backend.exceptions.UsuarioDuplicadoException;
import com.clubajedrez.backend.exceptions.UsuarioNoEncontradoException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    				   TarifaNoEncontradaException.class,
    				   UsuarioNoEncontradoException.class,
    			       PersonaNoEncontradaException.class})
    
    
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
    @ExceptionHandler({CuotaYaPagadaException.class, 
    				   CuotaDuplicadaException.class,
    				   InscripcionDuplicadaException.class,
    				   UsuarioDuplicadoException.class,       // Agregado
    			       TarifaNoConfiguradaException.class})
    
    public ResponseEntity<Map<String, String>> handleConflictosDeNegocio(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Conflicto de Regla de Negocio");
        response.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
 // Maneja excepciones de tipo "Acceso Denegado" (403)
    @ExceptionHandler({
        PerfilProtegidoException.class,
        CuentaInactivaException.class
    })
    public ResponseEntity<Map<String, String>> handleAccesoDenegado(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Acceso Denegado");
        response.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
 // Maneja excepciones de autenticación (401)
    @ExceptionHandler({
        BadCredentialsException.class,
        UsernameNotFoundException.class
    })
    public ResponseEntity<Map<String, String>> handleCredencialesInvalidas(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "No Autorizado");
        response.put("mensaje", "Usuario o contraseña incorrectos.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
}