package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Usuario;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Método clave para que Spring Security recupere al usuario en el login
    Optional<Usuario> findByUsername(String username);
    
    List<Usuario> findByIsActiveTrue();
    
    Optional<Usuario> findByUsernameAndIsActiveTrue(String username);
    
    boolean existsByPersona_IdPersona(Integer idPersona);
}