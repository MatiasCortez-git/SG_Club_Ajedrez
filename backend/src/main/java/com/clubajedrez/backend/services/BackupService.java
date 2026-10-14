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
    	ProcessBuilder processBuilder = new ProcessBuilder(
                "wsl.exe", "docker", "exec", "-i", "ajedrez_db", "psql", 
                "-v", "ON_ERROR_STOP=1", // <-- Esto fuerza a psql a fallar ante el primer error
                "-U", "postgres", 
                "-d", "club_ajedrez"
        );
        
        processBuilder.redirectErrorStream(true); // Une errores y salida estándar
        Process process = processBuilder.start();
        
        // 1. Consumimos la salida de la consola en un hilo separado para evitar el deadlock
        StringBuilder outputConsole = new StringBuilder();
        Thread readerThread = new Thread(() -> {
            try (InputStream is = process.getInputStream()) {
                outputConsole.append(new String(is.readAllBytes()));
            } catch (Exception e) {
                // Silenciamos errores de lectura del hilo secundario
            }
        });
        readerThread.start();
        
        // 2. Inyectamos el archivo directamente desde el stream (sin saturar la RAM)
        try (OutputStream os = process.getOutputStream();
             InputStream is = file.getInputStream()) {
            is.transferTo(os);
            os.flush();
        } // El try-with-resources cierra el OutputStream, avisando a psql que terminó el archivo
        
        // 3. Esperamos a que el proceso y la lectura terminen
        int exitCode = process.waitFor();
        readerThread.join(); 
        
        if (exitCode != 0) {
            // Ahora sí capturamos y mostramos por qué falló
            throw new RuntimeException("El script de restauración falló (Código " + exitCode + "). " 
                                     + "Detalle de PostgreSQL: " + outputConsole.toString());
        }
    }
    
}