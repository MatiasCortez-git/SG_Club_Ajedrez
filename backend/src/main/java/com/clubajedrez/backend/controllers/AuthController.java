package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.config.JwtUtil;
import com.clubajedrez.backend.dtos.AuthRequestDTO;
import com.clubajedrez.backend.dtos.AuthResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    // Inyección por constructor
    public AuthController(AuthenticationManager authenticationManager, 
                          UserDetailsService userDetailsService, 
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
    	
        // 1. Spring cruza la contraseña plana contra el hash de PostgreSQL
        authenticationManager.authenticate(
        		new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        

        // 2. Si la contraseña es correcta, traemos los datos del usuario
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. Generamos el pase VIP
        final String jwt = jwtUtil.generateToken(userDetails);

        // EXTRAEMOS EL ROL (Tomamos el primer permiso de la lista)
        final String rolUsuario = userDetails.getAuthorities().iterator().next().getAuthority();

        // 4. Devolvemos el token y el rol al frontend
        return ResponseEntity.ok(new AuthResponseDTO(jwt, rolUsuario));
    }
}