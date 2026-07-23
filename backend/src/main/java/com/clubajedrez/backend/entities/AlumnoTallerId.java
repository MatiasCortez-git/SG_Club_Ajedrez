package com.clubajedrez.backend.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoTallerId implements Serializable {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Integer idAlumno;
    private Integer idTaller;

    // ==========================================
    // MÉTODOS NATIVOS PARA CALMAR A HIBERNATE
    // ==========================================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AlumnoTallerId that = (AlumnoTallerId) o;
        return Objects.equals(idAlumno, that.idAlumno) && 
               Objects.equals(idTaller, that.idTaller);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idAlumno, idTaller);
    }
}