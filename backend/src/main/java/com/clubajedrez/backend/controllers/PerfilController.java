package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.CambioPasswordDTO;
import com.clubajedrez.backend.dtos.CambioPasswordVoluntarioDTO;
import com.clubajedrez.backend.dtos.DatosContactoDTO;
import com.clubajedrez.backend.dtos.PerfilResponseDTO;
import com.clubajedrez.backend.services.UsuarioService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/perfil")
public class PerfilController {

    private final UsuarioService usuarioService;

    public PerfilController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }
    
 // 1. Endpoint de Lectura
    @GetMapping("/me")
    public ResponseEntity<PerfilResponseDTO> obtenerPerfil(Authentication authentication) {
        String usernameActual = authentication.getName();
        PerfilResponseDTO perfil = usuarioService.obtenerPerfil(usernameActual);
        return ResponseEntity.ok(perfil);
    }

    // 2. Endpoint de Cambio Voluntario
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> cambiarPassword(Authentication authentication, @RequestBody CambioPasswordVoluntarioDTO dto) {
        String usernameActual = authentication.getName();
        
        usuarioService.cambiarPassword(usernameActual, dto.getPasswordActual(), dto.getPasswordNueva());
        
        // Devolvemos el Map estructurado como JSON para evitar errores en el frontend
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Contraseña actualizada exitosamente.");
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/contacto")
    public ResponseEntity<Map<String, String>> actualizarContacto(Authentication authentication, @RequestBody DatosContactoDTO dto) {
        String usernameActual = authentication.getName();
        
        // Delegación de la lógica transaccional al servicio
        usuarioService.actualizarContacto(usernameActual, dto);

        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Datos de contacto actualizados correctamente.");
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/me/activar-cuenta")
    public ResponseEntity<Map<String, String>> activarCuenta(Authentication authentication, @RequestBody CambioPasswordDTO dto) {
        String usernameActual = authentication.getName(); // Obtenemos el email validado por el token
        
        usuarioService.activarCuenta(usernameActual, dto.getNuevaPassword());
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Contraseña actualizada. Cuenta activada correctamente.");
        return ResponseEntity.ok(response);
    }
    
}