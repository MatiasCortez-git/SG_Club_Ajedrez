package com.clubajedrez.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.AlumnoResponseDTO;
import com.clubajedrez.backend.dtos.TallerCreateDTO;
import com.clubajedrez.backend.dtos.TallerResponseDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.Profesor;
import com.clubajedrez.backend.entities.Taller;
import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.ProfesorNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerNoEncontradoException;
import com.clubajedrez.backend.exceptions.TallerSinCupoException;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;
import com.clubajedrez.backend.repositories.ProfesorRepository;
import com.clubajedrez.backend.repositories.TallerRepository;

@Service
public class TallerServiceImpl implements TallerService {

    private final TallerRepository tallerRepository;
    private final AlumnoRepository alumnoRepository;
    private final AlumnoTallerRepository alumnoTallerRepository; // 1. Nueva dependencia
    private final ProfesorRepository profesorRepository;

    // 2. Inyección por constructor de las 3 dependencias 
    public TallerServiceImpl(TallerRepository tallerRepository, 
                             AlumnoRepository alumnoRepository,
                             AlumnoTallerRepository alumnoTallerRepository,
                             ProfesorRepository profesorRepository) {
        this.tallerRepository = tallerRepository;
        this.alumnoRepository = alumnoRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
        this.profesorRepository = profesorRepository;
    }
    
    @Override
    @Transactional
    public TallerResponseDTO crearTaller(TallerCreateDTO dto) {
        // 1. Convertimos el DTO de entrada en una Entidad Taller
        Taller nuevoTaller = mapToEntity(dto);
        
        // 2. Persistimos en PostgreSQL
        Taller tallerGuardado = tallerRepository.save(nuevoTaller);
        
        // 3. Retornamos la Entidad convertida a DTO de respuesta
        return mapToDTO(tallerGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public TallerResponseDTO obtenerTallerPorId(Integer idTaller) {
        // 1. Buscamos en la BD o lanzamos excepción si no existe
        Taller taller = tallerRepository.findByIdTallerAndIsActiveTrue(idTaller)
                .orElseThrow(() -> new TallerNoEncontradoException("Taller no encontrado con ID: " + idTaller));
        
        // 2. Retornamos el DTO
        return mapToDTO(taller);
    }

    @Override
    @Transactional // Manejo atómico: Si el Trigger de Postgres o Java fallan, se hace rollback
    public void inscribirAlumno(Integer idAlumno, Integer idTaller) {
        
        // A. Validar que exista el alumno
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No se encontró un alumno con el ID: " + idAlumno));

        // B. Validar que exista el taller
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new TallerNoEncontradoException("Taller no encontrado con ID: " + idTaller));

        // C. Consultar la cantidad de alumnos inscriptos en la tabla intermedia
       
        long inscriptosActuales = alumnoTallerRepository.countByTaller_IdTaller(idTaller);

        // D. REGLA DE NEGOCIO: Validar contra el cupo máximo del taller
        if (inscriptosActuales >= taller.getCupoMaximo()) { 
            throw new TallerSinCupoException("El taller '" + taller.getNombre() + "' ya no tiene cupos disponibles.");
        }

        // E. Guardar el nuevo registro en la tabla intermedia Alumno_Taller
        AlumnoTaller nuevaInscripcion = new AlumnoTaller();
        nuevaInscripcion.setAlumno(alumno);
        nuevaInscripcion.setTaller(taller);
        nuevaInscripcion.setFechaInscripcion(LocalDateTime.now());
        
     // Tomamos el costo/precio actual del taller y lo congelamos en la inscripción
        nuevaInscripcion.setPrecioAcordado(taller.getPrecioActual());
        
        alumnoTallerRepository.save(nuevaInscripcion);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<TallerResponseDTO> obtenerTodos() {
        // Buscamos todos los talleres y los convertimos a DTO reutilizando tu mapToDTO
        return tallerRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public TallerResponseDTO actualizarTaller(Integer idTaller, TallerCreateDTO dto) {
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new TallerNoEncontradoException("Taller no encontrado con ID: " + idTaller));
        
        // Buscamos el OBJETO Profesor usando el ID que viene en el DTO
        Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                .orElseThrow(() -> new ProfesorNoEncontradoException("No se encontró un profesor con el ID: " + dto.getIdProfesor()));
        
        taller.setNombre(dto.getNombre());
        taller.setCupoMaximo(dto.getCupoMaximo());
        taller.setDuracion(dto.getDuracion());
        taller.setPrecioActual(dto.getCosto());
        taller.setNivel(dto.getTipoNivel());
     
        // Asignamos el objeto completo, resolviendo el error de tipos
        taller.setProfesor(profesor);

        Taller tallerActualizado = tallerRepository.save(taller);
        return mapToDTO(tallerActualizado);
    }

    @Override
    @Transactional
    public void eliminarTaller(Integer idTaller) {
        Taller taller = tallerRepository.findById(idTaller)
                .orElseThrow(() -> new TallerNoEncontradoException("Taller no encontrado con ID: " + idTaller));
        
        // Baja lógica
        taller.setIsActive(false);
        tallerRepository.save(taller);
    }
    
    @Override
    @Transactional
    public void desinscribirAlumno(Integer idAlumno, Integer idTaller) {
        alumnoTallerRepository.eliminarInscripcion(idAlumno, idTaller);
    }

    @Override
    @Transactional
    public void resetearCicloLectivo() {
        // TRUNCATE vacía la tabla a nivel de disco al instante
        alumnoTallerRepository.vaciarTodasLasAulas();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoResponseDTO> obtenerAlumnosPorTaller(Integer idTaller) {
        List<Alumno> alumnos = alumnoTallerRepository.findAlumnosByTallerId(idTaller);
        
        return alumnos.stream()
                .map(this::mapAlumnoToDTO) // Asume que tienes este método privado mapeando tu AlumnoResponseDTO
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void resetearCicloLectivoPorTaller(Integer idTaller) {
        alumnoTallerRepository.vaciarAulaPorTaller(idTaller);
    }
    
 // =========================================================================
    // MÉTODOS PRIVADOS DE MAPEO (DTO <-> ENTIDAD)
    // =========================================================================

    private Taller mapToEntity(TallerCreateDTO dto) {
        Taller taller = new Taller();
        taller.setNombre(dto.getNombre()); 
        taller.setCupoMaximo(dto.getCupoMaximo());
        taller.setNivel(dto.getTipoNivel());
        taller.setPrecioActual(dto.getCosto());
        taller.setIsActive(true); // Estado por defecto al crear
        
     // Buscamos el Profesor en la base de datos por su idPersona
        if (dto.getIdProfesor() != null) {
            Profesor profesor = profesorRepository.findById(dto.getIdProfesor())
                    .orElseThrow(() -> new ProfesorNoEncontradoException("No se encontró un profesor con el ID: " + dto.getIdProfesor()));
            taller.setProfesor(profesor);
        }
        return taller;
    }

    private TallerResponseDTO mapToDTO(Taller taller) {
        TallerResponseDTO dto = new TallerResponseDTO();
        dto.setIdTaller(taller.getIdTaller());
        dto.setNombre(taller.getNombre());
        dto.setCupoMaximo(taller.getCupoMaximo());
        dto.setTipoNivel(taller.getNivel());
        dto.setCosto(taller.getPrecioActual());
        dto.setDuracion(taller.getDuracion());
        
     // Extraemos idPersona de la relación con Profesor
        if (taller.getProfesor() != null) {
            dto.setIdProfesor(taller.getProfesor().getIdPersona());
        }
        
     //  Calculamos los inscriptos delegando a la BD
        // Podés usar el método de conteo que habías creado antes, por ejemplo:
        long cantidadInscriptos = alumnoTallerRepository.countByTaller_IdTaller(taller.getIdTaller());
        dto.setInscriptos((int) cantidadInscriptos);
        
        return dto;
    }
    
    private AlumnoResponseDTO mapAlumnoToDTO(Alumno alumno) {
        AlumnoResponseDTO dto = new AlumnoResponseDTO();
        dto.setIdPersona(alumno.getIdPersona());
        dto.setNombre(alumno.getNombre());
        dto.setApellido(alumno.getApellido());
        dto.setDni(alumno.getDni());
        dto.setEmail(alumno.getEmail());
        dto.setTelefono(alumno.getTelefono());
        dto.setFechaNacimiento(alumno.getFechaNacimiento());
        return dto;
    }
}