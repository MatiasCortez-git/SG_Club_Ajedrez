package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Método clave para que Spring Security recupere al usuario en el login
    Optional<Usuario> findByUsername(String username);
}