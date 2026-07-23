package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cuota")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuota")
    private Integer idCuota;

    // Relación con el Alumno
    @ManyToOne
    @JoinColumn(name = "id_alumno", nullable = false)
    private Alumno alumno;

    @Column(nullable = false, length = 7)
    private String periodo;

    @Column(name = "monto_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBase;

    @Column(name = "monto_federado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoFederado;

    @Column(name = "monto_talleres", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTalleres;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    // Estado con valor por defecto
    @Column(length = 20)
    private String estado = "Pendiente";

    // Relación opcional con Pago (un pago puede asociarse después cuando se liquide la cuota)
    @ManyToOne
    @JoinColumn(name = "id_pago")
    private Pago pago;
}