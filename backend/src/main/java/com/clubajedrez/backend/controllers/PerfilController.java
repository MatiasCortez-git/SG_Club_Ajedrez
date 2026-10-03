package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.DatosContactoDTO;
import com.clubajedrez.backend.services.UsuarioService;
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

    @PutMapping("/me/contacto")
    public ResponseEntity<String> actualizarContacto(Authentication authentication, @RequestBody DatosContactoDTO dto) {
        String usernameActual = authentication.getName();
        
        // Delegación de la lógica transaccional al servicio
        usuarioService.actualizarContacto(usernameActual, dto);

        return ResponseEntity.ok("Datos de contacto actualizados correctamente.");
    }
}