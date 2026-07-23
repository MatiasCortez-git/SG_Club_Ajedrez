package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "taller_horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TallerHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Integer idHorario;

    // Relación Muchos a Uno con el Taller
    @ManyToOne
    @JoinColumn(name = "id_taller", nullable = false)
    private Taller taller;

    @Column(name = "dia_semana", nullable = false, length = 20)
    private String diaSemana;

    // LocalTime es el mapeo exacto para "time without time zone" de PostgreSQL
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

}
