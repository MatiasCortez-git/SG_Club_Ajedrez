package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.CuotaCalculoResponseDTO;
import com.clubajedrez.backend.services.CuotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cuotas")
public class CuotaController {

    private final CuotaService cuotaService;

    public CuotaController(CuotaService cuotaService) {
        this.cuotaService = cuotaService;
    }

    // 4. Simular/Calcular Cuota Mensual
    @GetMapping("/calcular/{idAlumno}")
    public ResponseEntity<CuotaCalculoResponseDTO> calcularCuotaMensual(@PathVariable Integer idAlumno) {
        CuotaCalculoResponseDTO calculo = cuotaService.calcularCuotaMensual(idAlumno);
        return ResponseEntity.ok(calculo); // 200 OK
    }
}