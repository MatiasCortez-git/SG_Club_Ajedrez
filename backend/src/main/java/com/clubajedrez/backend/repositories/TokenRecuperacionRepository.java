package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.TokenRecuperacion;
import com.clubajedrez.backend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Integer> {
    Optional<TokenRecuperacion> findByToken(String token);
    void deleteByUsuario(Usuario usuario);
}