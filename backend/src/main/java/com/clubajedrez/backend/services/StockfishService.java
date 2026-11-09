package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

@Service
public class StockfishService {

    private Process engineProcess;
    private BufferedReader processReader;
    private OutputStreamWriter processWriter;

    // Ajusta esta ruta a donde dejaste el .exe extraído
    private final String STOCKFISH_PATH = "C:/Proyecto/stockfish/stockfish.exe";

    public StockfishService() {
        iniciarMotor();
    }

    private void iniciarMotor() {
        try {
            System.out.println("⏳ Iniciando motor Stockfish local...");
            engineProcess = new ProcessBuilder(STOCKFISH_PATH).start();
            processReader = new BufferedReader(new InputStreamReader(engineProcess.getInputStream()));
            processWriter = new OutputStreamWriter(engineProcess.getOutputStream());
            
            // Inicializamos el protocolo UCI (Universal Chess Interface)
            sendCommand("uci");
            System.out.println("✅ Stockfish listo y esperando comandos.");
        } catch (Exception e) {
            System.err.println("❌ Error al iniciar Stockfish: " + e.getMessage());
        }
    }

    private void sendCommand(String command) {
        try {
            processWriter.write(command + "\n");
            processWriter.flush();
        } catch (IOException e) {
            System.err.println("Error enviando comando a Stockfish: " + e.getMessage());
        }
    }

    /**
     * Evalúa una posición FEN y devuelve la ventaja.
     * Positivo = ventaja blanca, Negativo = ventaja negra.
     */
    public double evaluarPosicion(String fen, int profundidad) {
        sendCommand("position fen " + fen);
        sendCommand("go depth " + profundidad); 

        double score = 0.0;
        try {
            String line;
            while ((line = processReader.readLine()) != null) {
                // Capturamos la evaluación en centipeones
                if (line.contains("score cp")) {
                    String[] partes = line.split("score cp ");
                    String[] subPartes = partes[1].split(" ");
                    // Dividimos por 100 para convertir a peones (ej: 150 -> 1.5)
                    score = Double.parseDouble(subPartes[0]) / 100.0; 
                } 
                // Capturamos si hay un mate forzado detectado
                else if (line.contains("score mate")) {
                    String[] partes = line.split("score mate ");
                    String[] subPartes = partes[1].split(" ");
                    int mateEn = Integer.parseInt(subPartes[0]);
                    score = mateEn > 0 ? 100.0 : -100.0; 
                }
                
                // Cuando el motor imprime 'bestmove', terminó su cálculo para esa profundidad
                if (line.startsWith("bestmove")) {
                    break;
                }
            }
        } catch (Exception e) {
            System.err.println("Error leyendo respuesta de Stockfish: " + e.getMessage());
        }
        
        return score;
    }

    // Se ejecuta automáticamente al apagar Spring Boot para matar el proceso .exe
    @PreDestroy
    public void apagarMotor() {
        System.out.println("🛑 Apagando proceso Stockfish...");
        sendCommand("quit");
        if (engineProcess != null) {
            engineProcess.destroy();
        }
    }
}