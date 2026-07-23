package com.clubajedrez.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alumno_taller")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoTaller {

    // 1. Aquí inyectamos la clave primaria compuesta que creamos en el paso 1
    @EmbeddedId
    private AlumnoTallerId id = new AlumnoTallerId();

    // 2. Mapeamos la relación con el Alumno
    // @MapsId le dice a JPA: "El id de este objeto Alumno, mételo adentro de idAlumno de mi AlumnoTallerId"
    @ManyToOne
    @MapsId("idAlumno") 
    @JoinColumn(name = "id_alumno")
    private Alumno alumno;

    // 3. Mapeamos la relación con el Taller
    @ManyToOne
    @MapsId("idTaller")
    @JoinColumn(name = "id_taller")
    private Taller taller;

    // 4. Agregamos las columnas extra de tu SQL
    @Column(name = "precio_acordado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAcordado;

    @CreationTimestamp
    @Column(name = "fecha_inscripcion", updatable = false)
    private LocalDateTime fechaInscripcion;
}