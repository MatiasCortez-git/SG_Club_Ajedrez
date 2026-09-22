package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.DatosContactoDTO;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.exceptions.CuentaInactivaException;
import com.clubajedrez.backend.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/perfil")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;

    public PerfilController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PutMapping("/me/contacto")
    @Transactional
    public ResponseEntity<String> actualizarContacto(Authentication authentication, @RequestBody DatosContactoDTO dto) {
        // Spring Security inyecta automáticamente al usuario logueado en 'authentication'
        String usernameActual = authentication.getName();
        
        Usuario usuario = usuarioRepository.findByUsernameAndIsActiveTrue(usernameActual)
                .orElseThrow(() -> new CuentaInactivaException("Acceso rechazado: Su cuenta de usuario se encuentra inactiva."));

        // Modificamos ÚNICAMENTE el teléfono y el email de la persona vinculada
        usuario.getPersona().setTelefono(dto.getTelefono());
        usuario.getPersona().setEmail(dto.getEmail());
        
        // Al guardar el usuario, JPA actualiza la tabla Persona por efecto en cascada (requiere cascade en la entidad)
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Datos de contacto actualizados correctamente.");
    }
}