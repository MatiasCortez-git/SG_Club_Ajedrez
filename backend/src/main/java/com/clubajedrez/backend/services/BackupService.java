package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Service
public class BackupService {

    public InputStream generarBackup() throws IOException {
      
        ProcessBuilder processBuilder = new ProcessBuilder(
        		"wsl", "docker", "exec", "ajedrez_db", "pg_dump", "-U", "postgres", "-d", "club_ajedrez", "--clean"
        );
        
        Process process = processBuilder.start();
        
        // Retornamos el flujo de datos crudo del archivo .sql generado
        return process.getInputStream();
    }
    
    public void restaurarBackup(MultipartFile file) throws Exception {
        // El flag -i es crucial: permite inyectar datos al proceso
        ProcessBuilder processBuilder = new ProcessBuilder(
                "wsl.exe", "docker", "exec", "-i", "ajedrez_db", "psql", "-U", "postgres", "-d", "club_ajedrez"
        );
        
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        
        // Escribimos el binario del archivo directamente en la consola de PostgreSQL
        try (OutputStream os = process.getOutputStream()) {
            os.write(file.getBytes());
            os.flush();
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("El script de restauración falló con código: " + exitCode);
        }
    }
    
}