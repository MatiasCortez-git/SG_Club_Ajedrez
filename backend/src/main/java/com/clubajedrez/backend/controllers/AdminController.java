package com.clubajedrez.backend.controllers;

import com.clubajedrez.backend.services.BackupService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
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
    public ResponseEntity<String> restaurarBackup(@RequestParam("file") MultipartFile file) {
        try {
            backupService.restaurarBackup(file);
            return ResponseEntity.ok("Base de datos restaurada con éxito.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al restaurar: " + e.getMessage());
        }
    }
    
}