package com.clubajedrez.backend.services;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Taller;
import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.TallerRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;

@Service
public class TallerServiceImpl implements TallerService {

    private final TallerRepository tallerRepository;
    private final AlumnoRepository alumnoRepository;
    private final AlumnoTallerRepository alumnoTallerRepository; // 1. Nueva dependencia

    // 2. Inyección por constructor de las 3 dependencias 
    public TallerServiceImpl(TallerRepository tallerRepository, 
                             AlumnoRepository alumnoRepository,
                             AlumnoTallerRepository alumnoTallerRepository) {
        this.tallerRepository = tallerRepository;
        this.alumnoRepository = alumnoRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
    }

    @Override
    @Transactional // Manejo atómico: Si el Trigger de Postgres o Java fallan, se hace rollback
    public void inscribirAlumno(Integer idAlumno, Integer idTaller) {
        
        // A. Validar que exista el alumno
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No se encontró un alumno con el ID: " + idAlumno));

        // B. Validar que exista el taller
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new RuntimeException("No se encontró el taller con ID: " + idTaller));

        // C. Consultar la cantidad de alumnos inscriptos en la tabla intermedia
        // Ejemplo definiendo la ventana de tiempo del año lectivo actual:
        LocalDateTime inicioAno = LocalDateTime.of(LocalDateTime.now().getYear(), 1, 1, 0, 0);
        LocalDateTime finAno = LocalDateTime.of(LocalDateTime.now().getYear(), 12, 31, 23, 59);

        long inscriptosActuales = alumnoTallerRepository.contarInscriptosEnPeriodo(idTaller, inicioAno, finAno);

        // D. REGLA DE NEGOCIO: Validar contra el cupo máximo del taller
        if (inscriptosActuales >= taller.getCupoMaximo()) { 
            throw new TallerSinCupoException("El taller '" + taller.getNombre() + "' ya no tiene cupos disponibles.");
        }

        // E. Guardar el nuevo registro en la tabla intermedia Alumno_Taller
        AlumnoTaller nuevaInscripcion = new AlumnoTaller();
        nuevaInscripcion.setAlumno(alumno);
        nuevaInscripcion.setTaller(taller);
        nuevaInscripcion.setFechaInscripcion(LocalDateTime.now());

        alumnoTallerRepository.save(nuevaInscripcion);
    }
}