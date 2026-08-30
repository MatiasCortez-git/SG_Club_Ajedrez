package com.clubajedrez.backend.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;
import com.clubajedrez.backend.dtos.CuotaResponseDTO;
import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.exceptions.CuotaDuplicadaException;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.DetalleCuota;
import com.clubajedrez.backend.entities.TarifaGlobal;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.TarifaGlobalRepository;


import com.clubajedrez.backend.repositories.FederadoRepository;

@Service
public class CuotaServiceImpl implements CuotaService {

    private final AlumnoRepository alumnoRepository;
    private final TarifaGlobalRepository tarifaGlobalRepository;
    private final FederadoRepository federadoRepository;
    private final AlumnoTallerRepository alumnoTallerRepository;
    private final CuotaRepository cuotaRepository;

    // Inyección por constructor
    public CuotaServiceImpl(AlumnoRepository alumnoRepository, 
                            TarifaGlobalRepository tarifaGlobalRepository,
                            FederadoRepository federadoRepository,
                            AlumnoTallerRepository alumnoTallerRepository,
                            CuotaRepository cuotaRepository) {
        this.alumnoRepository = alumnoRepository;
        this.tarifaGlobalRepository = tarifaGlobalRepository;
        this.federadoRepository = federadoRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
        this.cuotaRepository = cuotaRepository;
    }
    
    @Override
    public CuotaCalculoResponseDTO calcularCuotaMensual(Integer idAlumno) {
        
        // 1. Buscamos al alumno
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No existe el alumno con ID: " + idAlumno));

        // 2. Buscamos las tarifas en la Base de Datos por su "Concepto"
        TarifaGlobal tarifaSocio = tarifaGlobalRepository.findByConcepto("Cuota Socio")
                .orElseThrow(() -> new RuntimeException("Error: Falta configurar la 'Cuota Socio' en la tabla Tarifa_Global"));
                
        TarifaGlobal tarifaFederado = tarifaGlobalRepository.findByConcepto("Adicional Federado")
                .orElseThrow(() -> new RuntimeException("Error: Falta configurar el 'Adicional Federado' en la tabla Tarifa_Global"));

        // 3. Iniciamos el acumulador con el monto de la cuota base
        BigDecimal montoTotal = tarifaSocio.getMontoActual();// BigDecimal en la entidad;

        // 4. Regla: ¿Es federado? 
        if (esFederado(alumno)) { 
        	montoTotal = montoTotal.add(tarifaFederado.getMontoActual());
        }

        // 5. Regla: Sumar los precios de los talleres
        Double totalTalleres = alumnoTallerRepository.sumarTalleresVigentes(alumno.getIdPersona());
        BigDecimal montoTalleres = BigDecimal.ZERO; // Inicializamos en 0 por defecto
        
        if (totalTalleres != null) {
        	 montoTalleres = BigDecimal.valueOf(totalTalleres);
             // Sumamos y reasignamos
             montoTotal = montoTotal.add(montoTalleres);
        }
        
     // 6. Armar la respuesta (El empaquetado final para la API)
        CuotaCalculoResponseDTO response = new CuotaCalculoResponseDTO();
        response.setIdAlumno(alumno.getIdPersona());
        response.setNombreCompleto(alumno.getNombre() + " " + alumno.getApellido());
        response.setMontoBase(tarifaSocio.getMontoActual());
     // Si no es federado, el desglose debe decir 0, no el costo de la tarifa
        response.setMontoFederado(esFederado(alumno) ? tarifaFederado.getMontoActual() : BigDecimal.ZERO);
        response.setMontoTalleres(montoTalleres);
        response.setTotalPagar(montoTotal);

        return response;
    }
    
    
    @Override
    @Transactional
    public CuotaResponseDTO generarYGuardarCuotaMensual(Integer idAlumno, String periodo) {
        
    	// 1. Prevención de Duplicados (Fail-Fast)
        if (cuotaRepository.existsByAlumno_IdPersonaAndPeriodo(idAlumno, periodo)) {
            throw new CuotaDuplicadaException("El periodo " + periodo + " ya está facturado para este alumno.");        }
        
        // 2. Buscamos el alumno (necesitamos la entidad física para guardarla en la cuota)
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No existe el alumno"));
        
        	// Leer tarifas globales actuales     
        TarifaGlobal tarifaSocio = tarifaGlobalRepository.findByConcepto("Cuota Socio")
                .orElseThrow(() -> new RuntimeException("Error: Falta configurar la 'Cuota Socio' en la tabla Tarifa_Global"));
                
        TarifaGlobal tarifaFederado = tarifaGlobalRepository.findByConcepto("Adicional Federado")
                .orElseThrow(() -> new RuntimeException("Error: Falta configurar el 'Adicional Federado' en la tabla Tarifa_Global"));

        // 3. Crear la cabecera de la Cuota
        Cuota nuevaCuota = new Cuota();
        nuevaCuota.setAlumno(alumno);
        nuevaCuota.setPeriodo(periodo);
        
        	// Regla de negocio: Vence a los 10 días desde que se genera
        nuevaCuota.setFechaVencimiento(LocalDate.now().plusDays(10)); 
        nuevaCuota.setEstado("Pendiente"); 
        
        // 4. Creamos el Snapshot Financiero (Entidad Cuota)
        List<DetalleCuota> detalles = new ArrayList<>();

        	// Ensamblar Detalle: Cuota Base
        DetalleCuota detalleBase = new DetalleCuota();
        detalleBase.setNombreConcepto("Cuota Base Socio");
        detalleBase.setMontoCongelado(tarifaSocio.getMontoActual());
        detalleBase.setCuota(nuevaCuota);
        detalles.add(detalleBase);

        	// Ensamblar Detalle: Adicional Federado (Si aplica)
        if (federadoRepository.existsById(alumno.getIdPersona())) {
            DetalleCuota detalleFed = new DetalleCuota();
            detalleFed.setNombreConcepto("Adicional Federado");
            detalleFed.setMontoCongelado(tarifaFederado.getMontoActual());
            detalleFed.setCuota(nuevaCuota);
            detalles.add(detalleFed);
        }

        	// Ensamblar Detalles: Talleres vigentes (Snapshot de nombres y precios)
        List<AlumnoTaller> talleresVigentes = alumnoTallerRepository.findByAlumno_IdPersona(idAlumno);
        for (AlumnoTaller inscripcion : talleresVigentes) {
            DetalleCuota detalleTaller = new DetalleCuota();
            detalleTaller.setNombreConcepto("Taller: " + inscripcion.getTaller().getNombre());
            detalleTaller.setMontoCongelado(inscripcion.getPrecioAcordado());
            detalleTaller.setCuota(nuevaCuota);
            detalles.add(detalleTaller);
        }

        	// Vincular la lista de detalles a la cuota y guardar
        	// Gracias a CascadeType.ALL, al guardar la cuota se guardan todos los detalles
        nuevaCuota.setDetalles(detalles);
        
        
        // 5. Guardamos el comprobante en PostgreSQL
        Cuota cuotaGuardada = cuotaRepository.save(nuevaCuota);
        
        // Retornamos el DTO limpio
        return mapToDTO(cuotaGuardada);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CuotaResponseDTO> obtenerCuotasPorAlumno(Integer idAlumno) {
    	List<Cuota> cuotas = cuotaRepository.findByAlumno_IdPersona(idAlumno);
        
        return cuotas.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
   
    private CuotaResponseDTO mapToDTO(Cuota cuota) {
        CuotaResponseDTO dto = new CuotaResponseDTO();
        dto.setIdCuota(cuota.getIdCuota());
        dto.setIdAlumno(cuota.getAlumno().getIdPersona());
        dto.setPeriodo(cuota.getPeriodo());
        dto.setFechaVencimiento(cuota.getFechaVencimiento());
        dto.setEstado(cuota.getEstado());
        
        // Sumamos los detalles para enviarle el total al frontend
        java.math.BigDecimal total = cuota.getDetalles().stream()
                .map(DetalleCuota::getMontoCongelado)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
        dto.setMontoTotal(total);
        if (cuota.getPago() != null) {
            dto.setIdPago(cuota.getPago().getIdPago());
        }
        
        return dto;
    }
    

    /**
     * Método auxiliar para saber si es federado.
     */
    private boolean esFederado(Alumno alumno) {
        
        return federadoRepository.existsById(alumno.getIdPersona()); 
    }
}