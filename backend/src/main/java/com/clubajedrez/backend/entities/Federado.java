package com.clubajedrez.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "federado")
@Data
@EqualsAndHashCode(callSuper = true) // Clave para comparar correctamente heredando el ID de Persona
@NoArgsConstructor
@AllArgsConstructor
public class Federado extends Persona {

    // No ponemos @Id aquí, porque lo hereda automáticamente de la clase Persona

    @Column(name = "cod_federacion", nullable = false, unique = true, length = 50)
    private String codFederacion;

    @Column(nullable = false)
    private Integer elo;

}