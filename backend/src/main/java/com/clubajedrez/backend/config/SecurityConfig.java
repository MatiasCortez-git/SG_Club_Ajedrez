package com.clubajedrez.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            
		    // 0. Conectamos Spring Security con tu clase CorsConfig existente
		    .cors(Customizer.withDefaults())
        	
        	// 1. Desactivamos CSRF porque usaremos JWT (Tokens), no cookies de sesión
            .csrf(csrf -> csrf.disable())
            
            // 2. Le indicamos a Spring que nuestra API es "Stateless" (Sin estado)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 3. Configuramos las reglas de las rutas
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (Login y Buscador de DNI)
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/alumnos/dni/**").permitAll()
                .requestMatchers("/api/v1/reportes/ranking").permitAll()
                .requestMatchers("/api/v1/cuotas/alumno/**").permitAll()
                
                // Todo lo demás requiere estar autenticado
                .anyRequest().authenticated()
            );
        
     // Le decimos a Spring: "Ejecutá mi filtro de JWT ANTES de tu filtro por defecto"
        http.addFilterBefore(jwtRequestFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 4. Declaramos el encriptador de contraseñas que usaremos para comparar el hash de la BD
    @Bean
    public PasswordEncoder passwordEncoder() {
    	return new BCryptPasswordEncoder();
    }
    
    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}