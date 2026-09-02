package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.dtos.TarifaGlobalDTO;
import com.clubajedrez.backend.services.TarifaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tarifas")
public class TarifaController {

    private final TarifaService tarifaService;

    public TarifaController(TarifaService tarifaService) {
        this.tarifaService = tarifaService;
    }

    @GetMapping
    public ResponseEntity<List<TarifaGlobalDTO>> obtenerTarifas() {
        return ResponseEntity.ok(tarifaService.obtenerTarifas());
    }

    @PutMapping
    public ResponseEntity<Void> actualizarTarifas(@RequestBody List<TarifaGlobalDTO> tarifas) {
        tarifaService.actualizarTarifas(tarifas);
        return ResponseEntity.ok().build();
    }
}