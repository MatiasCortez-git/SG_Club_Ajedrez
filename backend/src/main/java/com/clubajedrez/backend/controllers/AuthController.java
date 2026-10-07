package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.config.JwtUtil;
import com.clubajedrez.backend.dtos.AuthRequestDTO;
import com.clubajedrez.backend.dtos.AuthResponseDTO;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.repositories.UsuarioRepository;

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

    public AuthController(AuthenticationManager authenticationManager, 
                          UserDetailsService userDetailsService, 
                          JwtUtil jwtUtil,
                          UsuarioRepository usuarioRepository) { // <-- Inyectar repositorio
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
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
}