package com.clubajedrez.backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profesor")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Profesor extends Persona {

    // La tabla profesor no tiene columnas extra, 
    // pero al heredar de Persona, ¡este objeto ya tiene id, nombre, dni, etc.!
    // Lo dejamos así, preparado para el futuro por si el club decide agregar 
    // columnas como "titulo_fide" o "salario".
}