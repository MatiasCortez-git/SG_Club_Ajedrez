package com.clubajedrez.backend.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "persona")
@Inheritance(strategy = InheritanceType.JOINED)
@Data // Magia de Lombok: nos crea los getters, setters, toString y equals automáticamente
@NoArgsConstructor // Requisito obligatorio de JPA: un constructor vacío
@AllArgsConstructor // Nos crea un constructor con todos los campos por si lo necesitamos
public class Persona {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Integer idPersona; //  usamos Long para IDs en lugar de Integer para tener mayor capacidad

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(unique = true, nullable = false, length = 20)
    private String dni;

    // En SQL no dice "NOT NULL", en Java NO le ponemos nullable=false. 
    // Así permitimos que sea opcional, pero si se carga, que sea único.
    @Column(unique = true, length = 150)
    private String email;

    @Column(length = 50)
    private String telefono;

    // Agregamos el borrado lógico. Le damos el valor 'true' por defecto.
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // @CreationTimestamp es magia pura: cuando guardes una nueva persona en Java, 
    // Hibernate pondrá la fecha y hora exacta del servidor automáticamente.
    // updatable = false asegura que nadie pueda modificar la fecha de creación después.
    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}