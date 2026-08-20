package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.clubajedrez.backend.dtos.PagoCreateDTO;
import com.clubajedrez.backend.dtos.PagoResponseDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.Pago;
import com.clubajedrez.backend.exceptions.CuotaYaPagadaException;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.PagoRepository;

@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final CuotaRepository cuotaRepository;
    private final AlumnoRepository alumnoRepository;

    // Inyección obligatoria por constructor
    public PagoServiceImpl(PagoRepository pagoRepository, CuotaRepository cuotaRepository, AlumnoRepository alumnoRepository) {
        this.pagoRepository = pagoRepository;
        this.cuotaRepository = cuotaRepository;
        this.alumnoRepository = alumnoRepository;
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
}
