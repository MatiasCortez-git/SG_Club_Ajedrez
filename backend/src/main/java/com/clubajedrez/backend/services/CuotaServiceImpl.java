package com.clubajedrez.backend.services;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;
import com.clubajedrez.backend.exceptions.AlumnoNoEncontradoException;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.TarifaGlobal;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;
import com.clubajedrez.backend.repositories.TarifaGlobalRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;

@Service
public class CuotaServiceImpl implements CuotaService {

    private final AlumnoRepository alumnoRepository;
    private final TarifaGlobalRepository tarifaGlobalRepository;
    private final FederadoRepository federadoRepository;
    private final AlumnoTallerRepository alumnoTallerRepository;

    // Inyección por constructor
    public CuotaServiceImpl(AlumnoRepository alumnoRepository, 
                            TarifaGlobalRepository tarifaGlobalRepository,
                            FederadoRepository federadoRepository,
                            AlumnoTallerRepository alumnoTallerRepository) {
        this.alumnoRepository = alumnoRepository;
        this.tarifaGlobalRepository = tarifaGlobalRepository;
        this.federadoRepository = federadoRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
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

    /**
     * Método auxiliar para saber si es federado.
     */
    private boolean esFederado(Alumno alumno) {
        
        return federadoRepository.existsById(alumno.getIdPersona()); 
    }
}