package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Federado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FederadoRepository extends JpaRepository<Federado, Integer> {
    
    // Inserción nativa para saltar el conflicto de herencia de JPA
    @Modifying
    @Query(value = "INSERT INTO federado (id_persona, cod_federacion, elo) VALUES (:idPersona, :codFederacion, :elo)", nativeQuery = true)
    void registrarRolFederado(@Param("idPersona") Integer idPersona, @Param("codFederacion") String codFederacion, @Param("elo") Integer elo);
}