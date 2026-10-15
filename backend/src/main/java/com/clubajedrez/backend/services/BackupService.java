package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Service
public class BackupService {

    public InputStream generarBackup() throws IOException {
      
    	Process process;
        try {
            // Intento 1: Sin WSL (Para  Docker nativo)
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "exec", "ajedrez_db", "pg_dump", "-U", "postgres", "-d", "club_ajedrez", "--clean"
            );
            process = pb.start();
        } catch (IOException e) {
            // Intento 2: Fallback con WSL (Para tu PC)
            ProcessBuilder pb = new ProcessBuilder(
                    "wsl", "docker", "exec", "ajedrez_db", "pg_dump", "-U", "postgres", "-d", "club_ajedrez", "--clean"
            );
            process = pb.start();
        }
        
        // Retornamos el flujo de datos crudo del archivo .sql generado
        return process.getInputStream();
    }
    
    public void restaurarBackup(MultipartFile file) throws Exception {
    	Process process;
        try {
            // Intento 1: Sin WSL (Para Bruno)
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "exec", "-i", "ajedrez_db", "psql", 
                    "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "club_ajedrez"
            );
            pb.redirectErrorStream(true);
            process = pb.start();
        } catch (IOException e) {
            // Intento 2: Fallback con WSL (Para tu PC)
            ProcessBuilder pb = new ProcessBuilder(
                    "wsl.exe", "docker", "exec", "-i", "ajedrez_db", "psql", 
                    "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "club_ajedrez"
            );
            pb.redirectErrorStream(true);
            process = pb.start();
        }

	    // 1. Creamos una referencia inmutable para que Java permita usarla en el hilo
	    final Process finalProcess = process;
	    
	    // 2. Consumimos la salida de la consola en un hilo separado
	    StringBuilder outputConsole = new StringBuilder();
	    Thread readerThread = new Thread(() -> {
	        try (InputStream is = finalProcess.getInputStream()) { // Usamos finalProcess
	            outputConsole.append(new String(is.readAllBytes()));
	        } catch (Exception e) {
	            // Silenciamos errores de lectura
	        }
	    });
	    readerThread.start();
	    
	    // 3. Inyectamos el archivo directamente desde el stream
	    try (OutputStream os = finalProcess.getOutputStream(); // Usamos finalProcess
	         InputStream is = file.getInputStream()) {
	        is.transferTo(os);
	        os.flush();
	    } 
	    
	    // 4. Esperamos a que el proceso y la lectura terminen
	    int exitCode = finalProcess.waitFor(); // Usamos finalProcess
	    readerThread.join(); 
	    
	    if (exitCode != 0) {
	        throw new RuntimeException("El script de restauración falló (Código " + exitCode + "). " 
	                                 + "Detalle: " + outputConsole.toString());
	    }
    }
    
    
}