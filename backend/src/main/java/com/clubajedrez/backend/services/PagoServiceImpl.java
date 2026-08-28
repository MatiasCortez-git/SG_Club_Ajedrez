package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.clubajedrez.backend.dtos.ComprobanteDTO;
import com.clubajedrez.backend.dtos.PagoCreateDTO;
import com.clubajedrez.backend.dtos.PagoResponseDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.Pago;
import com.clubajedrez.backend.exceptions.CuotaYaPagadaException;
import com.clubajedrez.backend.exceptions.PagoNoEncontradoException;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.PagoRepository;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;

@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final CuotaRepository cuotaRepository;
    private final AlumnoRepository alumnoRepository;
    private final AlumnoTallerRepository alumnoTallerRepository;

    // Inyección obligatoria por constructor
    public PagoServiceImpl(PagoRepository pagoRepository, 
    		CuotaRepository cuotaRepository,
    		AlumnoRepository alumnoRepository, 
    		AlumnoTallerRepository alumnoTallerRepository) {
        
    	this.pagoRepository = pagoRepository;
        this.cuotaRepository = cuotaRepository;
        this.alumnoRepository = alumnoRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
    }

    @Override
    @Transactional
    public PagoResponseDTO registrarPago(PagoCreateDTO dto) {
        Alumno alumno = alumnoRepository.findById(dto.getIdAlumno())
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        List<Cuota> cuotasAPagar = cuotaRepository.findAllById(dto.getIdsCuotasAPagar());
        
        BigDecimal montoTotal = BigDecimal.ZERO;

        // Validación Fail-Fast y suma de montos
        for (Cuota cuota : cuotasAPagar) {
            if ("Pagada".equals(cuota.getEstado()) || cuota.getPago() != null) {
                throw new CuotaYaPagadaException("La cuota con ID " + cuota.getIdCuota() + " ya se encuentra pagada.");
            }
            
            // Recordá que eliminamos la redundancia del monto total en la BD, así que lo sumamos acá
            BigDecimal totalCuota = cuota.getMontoBase().add(cuota.getMontoFederado()).add(cuota.getMontoTalleres());
            montoTotal = montoTotal.add(totalCuota);
        }

        // Crear el comprobante (Pago)
        Pago nuevoPago = new Pago();
        nuevoPago.setAlumno(alumno);
        nuevoPago.setMedioPago(dto.getMedioPago());
        nuevoPago.setMontoTotal(montoTotal);
        nuevoPago.setFechaPago(LocalDateTime.now());
        
        Pago pagoGuardado = pagoRepository.save(nuevoPago);

        // Actualizar las cuotas asociándolas al nuevo pago
        for (Cuota cuota : cuotasAPagar) {
            cuota.setEstado("Pagada");
            cuota.setPago(pagoGuardado);
        }
        cuotaRepository.saveAll(cuotasAPagar);

        // Armar respuesta
        PagoResponseDTO response = new PagoResponseDTO();
        response.setIdPago(pagoGuardado.getIdPago());
        response.setFechaPago(pagoGuardado.getFechaPago());
        response.setMontoTotal(pagoGuardado.getMontoTotal());
        response.setMedioPago(pagoGuardado.getMedioPago());

        return response;
    }
    
    @Override
    @Transactional(readOnly = true)
    public ComprobanteDTO obtenerComprobantePorId(Integer idPago) {
        // 1. Buscar el pago
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new PagoNoEncontradoException("No se encontró el pago con ID: " + idPago));
        
        // 2. Extraer el alumno 
        Alumno alumno = pago.getAlumno();
        String nombreCompleto = alumno.getNombre() + " " + alumno.getApellido();

        // 3. Buscar cuotas asociadas al pago y formatear los periodos
        // Nota: Asegurate de tener este método findByPago_IdPago en tu CuotaRepository
        List<Cuota> cuotas = cuotaRepository.findByPago_IdPago(idPago);
        List<String> periodos = cuotas.stream()
                .map(Cuota::getPeriodo) 
                .collect(Collectors.toList());
        
        // Calcular subtotales con Streams y BigDecimal
        BigDecimal totalSocio = cuotas.stream()
                .map(Cuota::getMontoBase)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalFederado = cuotas.stream()
                .map(Cuota::getMontoFederado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 4. Buscar los talleres vigentes del alumno
        List<String> talleres = alumnoTallerRepository.findByAlumno_IdPersona(alumno.getIdPersona())
                .stream()
                .map(insc -> insc.getTaller().getNombre() + " ($" + insc.getPrecioAcordado() + ")")
                .collect(Collectors.toList());
        
        // 5. Ensamblar el DTO
        ComprobanteDTO comprobante = new ComprobanteDTO();
        comprobante.setIdPago(pago.getIdPago());
        comprobante.setFechaPago(pago.getFechaPago());
        comprobante.setMontoTotal(pago.getMontoTotal());
        comprobante.setMedioPago(pago.getMedioPago());
        comprobante.setNombreAlumno(nombreCompleto);
        comprobante.setPeriodosAbonados(periodos);
        comprobante.setTalleres(talleres);
        comprobante.setMontoSocio(totalSocio);
        comprobante.setMontoFederado(totalFederado);

        return comprobante;
    }
}
