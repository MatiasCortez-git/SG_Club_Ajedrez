package com.clubajedrez.backend.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;
import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.TarifaGlobal;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.TarifaGlobalRepository;

//import jakarta.transaction.Transactional;

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
    public void generarYGuardarCuotaMensual(Integer idAlumno, String periodo) {
        
        // 1. Reutilizamos la lógica llamando al método que ya armamos
        CuotaCalculoResponseDTO calculo = this.calcularCuotaMensual(idAlumno);

        // 2. Buscamos el alumno (necesitamos la entidad física para guardarla en la cuota)
        Alumno alumno = alumnoRepository.findById(idAlumno)
                .orElseThrow(() -> new AlumnoNoEncontradoException("No existe el alumno"));

        // 3. Creamos el Snapshot Financiero (Entidad Cuota)
        Cuota nuevaCuota = new Cuota();
        nuevaCuota.setAlumno(alumno);
        nuevaCuota.setPeriodo(periodo);
        
        // Tomamos los montos directamente del DTO calculado
        nuevaCuota.setMontoBase(calculo.getMontoBase());
        nuevaCuota.setMontoFederado(calculo.getMontoFederado());
        nuevaCuota.setMontoTalleres(calculo.getMontoTalleres());
        
        // Regla de negocio: Vence a los 10 días desde que se genera
        nuevaCuota.setFechaVencimiento(LocalDate.now().plusDays(10)); 
        nuevaCuota.setEstado("Pendiente"); 
        
        // 4. Guardamos el comprobante en PostgreSQL
        cuotaRepository.save(nuevaCuota);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Cuota> obtenerCuotasPorAlumno(Integer idAlumno) {
        return cuotaRepository.findByAlumno_IdPersona(idAlumno);
    }

    /**
     * Método auxiliar para saber si es federado.
     */
    private boolean esFederado(Alumno alumno) {
        
        return federadoRepository.existsById(alumno.getIdPersona()); 
    }
}