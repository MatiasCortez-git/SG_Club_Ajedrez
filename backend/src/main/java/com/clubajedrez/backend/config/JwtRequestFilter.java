package com.clubajedrez.backend.config;

 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    // Inyección por constructor
    public JwtRequestFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Buscamos la cabecera de Autorización en la petición de React
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Si la cabecera existe y arranca con "Bearer " (estándar JWT), extraemos el token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Si el token es inválido, adulterado o expiró, lo atrapamos acá
                logger.warn("El token JWT es inválido o ha expirado");
            }
        }

        // 3. Si encontramos un usuario en el token y todavía no está autenticado en este hilo
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Vamos a la base de datos a traer sus permisos reales
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 4. Si el token es legítimo
            if (jwtUtil.validateToken(jwt, userDetails)) {
                
                // Le armamos su credencial oficial de Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Lo dejamos pasar oficialmente
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 5. Continuamos con el ciclo de vida de la petición
        chain.doFilter(request, response);
    }
}