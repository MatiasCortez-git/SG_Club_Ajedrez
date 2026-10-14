package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.services.BackupService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final BackupService backupService;

    public AdminController(BackupService backupService) {
        this.backupService = backupService;
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/backup")
    public ResponseEntity<InputStreamResource> descargarBackup() {
        try {
            InputStream backupStream = backupService.generarBackup();
            InputStreamResource resource = new InputStreamResource(backupStream);

            // Generamos un nombre dinámico con la fecha y hora actual
            String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String nombreArchivo = "backup_" + fecha + ".sql";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/restore")
    public ResponseEntity<Map<String, String>> restaurarBackup(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            backupService.restaurarBackup(file);
            response.put("mensaje", "Base de datos restaurada con éxito.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Error al restaurar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
}