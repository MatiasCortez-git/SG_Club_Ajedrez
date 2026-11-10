package com.clubajedrez.backend.controllers.advice;

import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.CuentaInactivaException;
import com.clubajedrez.backend.exceptions.CuotaDuplicadaException;
import com.clubajedrez.backend.exceptions.CuotaYaPagadaException;
import com.clubajedrez.backend.exceptions.InscripcionDuplicadaException;
import com.clubajedrez.backend.exceptions.MotorAnalisisException;
import com.clubajedrez.backend.exceptions.PagoNoEncontradoException;
import com.clubajedrez.backend.exceptions.PerfilProtegidoException;
import com.clubajedrez.backend.exceptions.PersonaNoEncontradaException;
import com.clubajedrez.backend.exceptions.PgnInvalidoException;
import com.clubajedrez.backend.exceptions.ProfesorNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoFederadoException;
import com.clubajedrez.backend.exceptions.ServicioIAException;
import com.clubajedrez.backend.exceptions.TallerNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
import com.clubajedrez.backend.exceptions.TarifaNoConfiguradaException;
import com.clubajedrez.backend.exceptions.TarifaNoEncontradaException;
import com.clubajedrez.backend.exceptions.UsuarioDuplicadoException;
import com.clubajedrez.backend.exceptions.UsuarioNoEncontradoException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
    				   ProfesorNoFederadoException.class,
    				   IllegalArgumentException.class,
    				   PgnInvalidoException.class})
    
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
     CuentaInactivaException.class,
     AccessDeniedException.class
 })
 public ResponseEntity<Map<String, String>> handleAccesoDenegado(RuntimeException ex) {
     Map<String, String> response = new HashMap<>();
     response.put("error", "Acceso Denegado");
     
     // Si es el error nativo de Spring, forzamos nuestro mensaje. Si es una excepción propia, usamos su mensaje.
     String mensaje = (ex instanceof AccessDeniedException) 
         ? "No tienes los permisos de administrador necesarios para realizar esta acción." 
         : ex.getMessage();
         
     response.put("mensaje", mensaje);
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
    
 // Maneja choques de restricciones UNIQUE en la base de datos (PostgreSQL)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Dato Duplicado");

        // Extraemos el mensaje original de PostgreSQL
        String mensajeCausa = ex.getMostSpecificCause().getMessage().toLowerCase();
        String mensajeFinal = "El dato ingresado ya se encuentra registrado en el sistema.";

        // Evaluamos qué columna generó el conflicto
        if (mensajeCausa.contains("dni")) {
            mensajeFinal = "El DNI ingresado ya se encuentra registrado en otra cuenta.";
        } else if (mensajeCausa.contains("email") || mensajeCausa.contains("correo")) {
            mensajeFinal = "El correo electrónico ingresado ya se encuentra vinculado a otra cuenta.";
        } else if (mensajeCausa.contains("username")) {
            mensajeFinal = "El nombre de usuario ya está en uso. Por favor, elige otro.";
        }

        response.put("mensaje", mensajeFinal);
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
    // Manejador para los errores del servidor (500)
    @ExceptionHandler({ServicioIAException.class, MotorAnalisisException.class})
    public ResponseEntity<Map<String, String>> handleServerError(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Error Interno del Servidor");
        response.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
 // Manejo de variables o partes del multipart/form-data faltantes (El culpable del 401 fantasma)
    @ExceptionHandler({
        org.springframework.web.multipart.support.MissingServletRequestPartException.class,
        org.springframework.web.bind.MissingServletRequestParameterException.class,
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<Map<String, String>> handleMissingParams(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Solicitud HTTP mal formada");
        
        String detalle = "Faltan parámetros o el formato de los datos enviados es incorrecto en el form-data.";
        if (ex instanceof org.springframework.web.multipart.support.MissingServletRequestPartException) {
            detalle = "Falta la parte requerida en el form-data: " + ((org.springframework.web.multipart.support.MissingServletRequestPartException) ex).getRequestPartName();
        }
        
        response.put("mensaje", detalle);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Manejo de endpoints que no existen (404 de ruta)
    @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoHandlerFound(org.springframework.web.servlet.NoHandlerFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Ruta no encontrada");
        response.put("mensaje", "El endpoint [" + ex.getHttpMethod() + "] " + ex.getRequestURL() + " no existe en este servidor.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}