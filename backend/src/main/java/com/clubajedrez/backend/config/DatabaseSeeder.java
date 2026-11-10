package com.clubajedrez.backend.config;

import com.clubajedrez.backend.entities.Puzzle;
import com.clubajedrez.backend.repositories.PuzzleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "app.db.seed", havingValue = "true")
public class DatabaseSeeder implements CommandLineRunner {

    private final PuzzleRepository puzzleRepository;

    public DatabaseSeeder(PuzzleRepository puzzleRepository) {
        this.puzzleRepository = puzzleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("⏳ Iniciando la carga inteligente de puzzles...");
        
        String csvFilePath = "C:/Proyecto/lichess_db_puzzle.csv"; 
        
        int batchSize = 1000;
        int maxPorCategoria = 1000; // Limite de ejercicios por cada tema
        List<Puzzle> batch = new ArrayList<>();
        Map<String, Integer> conteoTemas = new HashMap<>();
        int insertados = 0;

        try (BufferedReader br = new BufferedReader(new FileReader(csvFilePath))) {
            String line;
            br.readLine(); 

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 8) continue; 

                String id = data[0];
                String fen = data[1];
                String moves = data[2];
                int rating = Integer.parseInt(data[3]);
                int popularity = Integer.parseInt(data[5]);
                String themes = data[7];

                if (rating >= 800 && rating <= 2200 && popularity >= 80) {
                    
                    // Lógica de balanceo: Verificamos si este puzzle aporta a alguna categoría que aún no está llena
                    boolean necesitaInsertarse = false;
                    String[] etiquetas = themes.split(" ");
                    
                    for (String etiqueta : etiquetas) {
                        int cantidadActual = conteoTemas.getOrDefault(etiqueta, 0);
                        if (cantidadActual < maxPorCategoria) {
                            necesitaInsertarse = true;
                            // Sumamos 1 al contador de esta categoría
                            conteoTemas.put(etiqueta, cantidadActual + 1);
                        }
                    }

                    if (necesitaInsertarse) {
                        batch.add(new Puzzle(id, fen, moves, rating, themes));

                        if (batch.size() >= batchSize) {
                            puzzleRepository.saveAll(batch);
                            insertados += batch.size();
                            System.out.println("✅ Insertados " + insertados + " puzzles balanceados...");
                            batch.clear();
                        }
                    }
                }
            }
            
            if (!batch.isEmpty()) {
                puzzleRepository.saveAll(batch);
                insertados += batch.size();
            }

            System.out.println("🚀 Carga finalizada con éxito.");
            System.out.println("Total de puzzles insertados: " + insertados);
            System.out.println("Categorías procesadas: " + conteoTemas.size());

        } catch (Exception e) {
            System.err.println("❌ Error al leer el CSV: " + e.getMessage());
        }
    }
}