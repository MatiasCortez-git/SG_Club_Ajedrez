package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.ComprobanteDTO;
import com.clubajedrez.backend.dtos.PagoCreateDTO;
import com.clubajedrez.backend.dtos.PagoResponseDTO;
import com.clubajedrez.backend.services.PagoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
public class PagoController {

    private final PagoService pagoService;

    // Inyección de dependencias por constructor
    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping
    public ResponseEntity<PagoResponseDTO> registrarPago(@RequestBody PagoCreateDTO dto) {
        // Delegamos el trabajo pesado al servicio
        PagoResponseDTO response = pagoService.registrarPago(dto);
        
        // Devolvemos el comprobante con un código 201 (Creado)
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
 // ENDPOINT PARA IMPRESIÓN DE RECIBOS
    @GetMapping("/{id}/comprobante")
    public ResponseEntity<ComprobanteDTO> obtenerComprobante(@PathVariable Integer id) {
        ComprobanteDTO comprobante = pagoService.obtenerComprobantePorId(id);
        return ResponseEntity.ok(comprobante);
    }
    
}