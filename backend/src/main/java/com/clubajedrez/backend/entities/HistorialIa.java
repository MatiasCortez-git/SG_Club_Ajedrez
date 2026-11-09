package com.clubajedrez.backend.entities;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "historial_ia")
@Getter // Lombok: Genera solo los getters automáticamente
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Lombok: Constructor vacío obligatorio para JPA, pero seguro
public class HistorialIa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private LocalDateTime fechaConsulta;
    
    // Constructor público que exige los datos obligatorios para crear el registro
    public HistorialIa(String username, LocalDateTime fechaConsulta) {
        this.username = username;
        this.fechaConsulta = fechaConsulta;
    }
}