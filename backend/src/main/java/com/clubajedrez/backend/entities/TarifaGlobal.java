package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarifa_global")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifaGlobal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tarifa")
    private Integer idTarifa;

    @Column(nullable = false, unique = true, length = 100)
    private String concepto;

    // Usamos BigDecimal porque representa dinero
    @Column(name = "monto_actual", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoActual;

    // Hibernate actualizará esta fecha automáticamente cada vez que modifiques el monto
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

}