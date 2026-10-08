package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.config.JwtUtil;
import com.clubajedrez.backend.dtos.AuthRequestDTO;
import com.clubajedrez.backend.dtos.AuthResponseDTO;
import com.clubajedrez.backend.dtos.ResetPasswordDTO;
import com.clubajedrez.backend.dtos.SolicitudRecuperacionDTO;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.repositories.UsuarioRepository;
import com.clubajedrez.backend.services.UsuarioService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, 
                          UserDetailsService userDetailsService, 
                          JwtUtil jwtUtil,
                          UsuarioRepository usuarioRepository,
                          UsuarioService usuarioService) { 
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
    	
        // 1. Spring cruza la contraseña plana contra el hash de PostgreSQL
        authenticationManager.authenticate(
        		new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        // 2. Si la contraseña es correcta, traemos los datos del usuario
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // Buscamos la entidad real para saber si debe cambiar la clave
        Usuario usuarioFisico = usuarioRepository.findByUsernameAndIsActiveTrue(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        
        // 3. Generamos el pase VIP
        final String jwt = jwtUtil.generateToken(userDetails);

        // EXTRAEMOS EL ROL (Tomamos el primer permiso de la lista)
        final String rolUsuario = userDetails.getAuthorities().iterator().next().getAuthority();

        // 4. Devolvemos el token y el rol al frontend
        return ResponseEntity.ok(new AuthResponseDTO(jwt, rolUsuario, usuarioFisico.getDebeCambiarPassword()));
    }
    
    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<Map<String, String>> solicitarRecuperacion(@RequestBody SolicitudRecuperacionDTO dto) {
        usuarioService.solicitarRecuperacionPassword(dto.getUsername());
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Si el correo se encuentra registrado, recibirás un enlace para restablecer tu contraseña.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordDTO dto) {
        usuarioService.resetearPasswordConToken(dto.getToken(), dto.getNuevaPassword());
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Tu contraseña ha sido restablecida exitosamente.");
        return ResponseEntity.ok(response);
    }
    
}