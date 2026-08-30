package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

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

 // Reemplazamos los montos individuales por esta lista
    @OneToMany(mappedBy = "cuota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCuota> detalles;
    
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