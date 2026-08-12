package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "taller")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Taller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_taller")
    private Integer idTaller;

    @Column(nullable = false, unique = true, length = 150)
    private String nombre;

    // Relación con el Profesor
    @ManyToOne
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    // Usamos BigDecimal para todo lo que sea dinero
    @Column(name = "precio_actual", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioActual;

    @Column(length = 50)
    private String duracion;

    @Column(name = "edad_minima")
    private Integer edadMinima;

    @Column(name = "edad_maxima")
    private Integer edadMaxima;

    @Column(length = 50)
    private String nivel;

    // Borrado lógico
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
