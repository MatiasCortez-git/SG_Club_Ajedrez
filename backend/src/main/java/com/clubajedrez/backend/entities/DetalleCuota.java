package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
public class DetalleCuota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalle;
    
    private String nombreConcepto;
    
    private BigDecimal montoCongelado;

    @ManyToOne
    @JoinColumn(name = "id_cuota")
    private Cuota cuota;
}