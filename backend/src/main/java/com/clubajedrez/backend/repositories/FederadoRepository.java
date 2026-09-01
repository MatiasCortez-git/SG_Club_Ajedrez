package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Federado;

import java.util.List;

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
    
    // Consultas nativas para evadir la caché de herencia de Hibernate
    @Query(value = "SELECT cod_federacion FROM federado WHERE id_persona = :idPersona", nativeQuery = true)
    String obtenerCodFederacion(@Param("idPersona") Integer idPersona);

    @Query(value = "SELECT elo FROM federado WHERE id_persona = :idPersona", nativeQuery = true)
    Integer obtenerElo(@Param("idPersona") Integer idPersona);

    @Modifying
    @Query(value = "UPDATE federado SET cod_federacion = :codFederacion, elo = :elo WHERE id_persona = :idPersona", nativeQuery = true)
    void actualizarRolFederado(@Param("idPersona") Integer idPersona, @Param("codFederacion") String codFederacion, @Param("elo") Integer elo);
    
    @Modifying
    @Query(value = "DELETE FROM federado WHERE id_persona = :idPersona", nativeQuery = true)
    void eliminarRolFederado(@Param("idPersona") Integer idPersona);
    
 // Filtra por borrado lógico (heredado de Persona) y ordena por ELO
    List<Federado> findByIsActiveTrueOrderByEloDesc();
    
}