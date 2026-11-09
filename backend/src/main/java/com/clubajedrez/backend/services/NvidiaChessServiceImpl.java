package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.AiChessResponseDTO;
import com.clubajedrez.backend.dtos.PlanificadorRequestDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.Puzzle;
import com.clubajedrez.backend.exceptions.MotorAnalisisException;
import com.clubajedrez.backend.exceptions.PgnInvalidoException;
import com.clubajedrez.backend.exceptions.ServicioIAException;
import com.clubajedrez.backend.repositories.AlumnoRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;
import com.clubajedrez.backend.repositories.PuzzleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.pgn.PgnHolder;
import com.github.bhlangonijr.chesslib.move.Move;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Service("nvidiaChessService")
public class NvidiaChessServiceImpl implements AiChessService {

    @Value("${nvidia.api.key}")
    private String apiKey;

    private final String NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();
    
    private record RespuestaIADTO(String textoMarkdown, List<String> etiquetas) {}
    private record JugadaCritica(String fenPrevio, String uciMove, double perdida) {}

    private final PuzzleRepository puzzleRepository;
    private final StockfishService stockfishService;
    private final AlumnoRepository alumnoRepository;
    private final FederadoRepository federadoRepository;

    public NvidiaChessServiceImpl(PuzzleRepository puzzleRepository,
    							  StockfishService stockfishService,
    							  AlumnoRepository alumnoRepository,
    							  FederadoRepository federadoRepository) {
        this.puzzleRepository = puzzleRepository;
        this.stockfishService = stockfishService;
        this.alumnoRepository = alumnoRepository;
        this.federadoRepository = federadoRepository;
    }

    @Override
    public AiChessResponseDTO analizarPgn(MultipartFile file, Integer alumnoId) {
        
        var alumno = alumnoRepository.findByIdPersonaAndIsActiveTrue(alumnoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado o inactivo en el sistema"));

        // 1. Calculamos la edad 
        int edad = 0;
        if (alumno.getFechaNacimiento() != null) {
            edad = java.time.Period.between(alumno.getFechaNacimiento(), java.time.LocalDate.now()).getYears();
        }

        // 2. Buscamos el ELO evadiendo la herencia de JPA con tu query nativa
        Integer eloValor = federadoRepository.obtenerElo(alumnoId);
        String elo = (eloValor != null) ? String.valueOf(eloValor) : "No federado";

        String contenidoPgn = extraerYValidarPgn(file, alumno);

        System.out.println("DEBUG - Stockfish analizando las partidas jugada a jugada...");
        String peoresFens = extraerPeoresJugadasConStockfish(file, alumno);

        // 3. El Prompt V3 usando la edad calculada y el ELO (como String)
        String prompt = String.format(
            "Actúa como un asesor pedagógico para profesores de ajedrez. " +
            "Analiza las siguientes partidas del alumno %s %s (Edad: %d, ELO: %s).\n\n" +
            "PARTIDAS:\n%s\n\n" +
            "Tu tarea es ayudar al profesor a entender el ESTILO de juego de su alumno. " +
            "Señala los patrones, puntos fuertes y débiles. Califica su nivel general en Apertura, Medio Juego y Final. " +
            "Brinda 2 o 3 recomendaciones concretas sobre qué temas debería enseñarle el profesor en la próxima clase basándote en su edad y nivel.\n" +
            "REGLA OBLIGATORIA: Devuelve SOLAMENTE un objeto JSON con dos claves: 'textoMarkdown' (String con tu informe en Markdown) y 'etiquetas' (Array vacío [], ya que aquí no aplican). NO generes códigos FEN.", 
            alumno.getNombre(),alumno.getApellido(), edad, elo, contenidoPgn
        );

        System.out.println("DEBUG - Enviando perfil a NVIDIA (NLP)...");
        String respuestaJson = llamarIA(prompt);
        RespuestaIADTO extraccion = procesarRespuestaIA(respuestaJson);

        return new AiChessResponseDTO(extraccion.textoMarkdown(), peoresFens);
    }

    @Override
    public AiChessResponseDTO generarEjercicios(PlanificadorRequestDTO dto) {
        int cantidad = Math.min(Math.max(dto.cantidad(), 1), 30);

        String prompt = String.format(
                "Eres un experto entrenador de ajedrez. El profesor solicita preparar esta clase: '%s'.\n" +
                "1. Analiza el texto y extrae los temas tácticos/estratégicos. Mapealos EXCLUSIVAMENTE a una o más de estas etiquetas oficiales de Lichess en inglés (ej: fork, pin, skewer, mateIn1, mateIn2, endgame, middlegame, sacrifice, advantage).\n" +
                "2. Redacta 2 o 3 consejos pedagógicos breves para dar esta clase.\n" +
                "REGLA OBLIGATORIA: Devuelve SOLAMENTE un objeto JSON con dos claves: 'textoMarkdown' (String con los consejos en Markdown) y 'etiquetas' (Array de strings en inglés).", 
                dto.tema()
            );

        String respuestaJson = llamarIA(prompt);
        RespuestaIADTO extraccion = procesarRespuestaIA(respuestaJson);

        // AQUÍ OCURRE LA MAGIA RAG (Retrieval-Augmented Generation)
        String pgnFinal = construirPgnDesdeBaseDeDatos(extraccion.etiquetas(), cantidad);

        return new AiChessResponseDTO(extraccion.textoMarkdown(), pgnFinal);
    }
    
    private String llamarIA(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "model", "meta/llama-3.2-90b-vision-instruct", 
            "messages", List.of(
                Map.of("role", "user", "content", prompt)
            ),
            "temperature", 0.3, // Temperatura baja para forzar el formato JSON
            "max_tokens", 1024
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + (apiKey != null ? apiKey.trim() : ""));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(NVIDIA_URL, requestEntity, String.class);
            
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            
            return  root.path("choices").get(0).path("message").path("content").asText();
                   
        } catch (Exception e) {
            System.out.println("Error NVIDIA API: " + e.getMessage());
            throw new ServicioIAException("Fallo en la comunicación con el motor de Inteligencia Artificial.");
        }
    }

    private String extraerYValidarPgn(MultipartFile file, Alumno alumno) {
        try {
            byte[] bytes = file.getBytes();
            // Dejamos el PGN intacto (que tiene las etiquetas [White] y [Black]) 
            // pero borramos comentarios de reloj {[%clk...]} para no marear a la IA
            String pgnCrudo = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            String contenidoLimpio = pgnCrudo.replaceAll("\\{.*?\\}", "").trim();

            Path tempPath = Files.createTempFile("torneo", ".pgn");
            Files.write(tempPath, bytes);
            
            PgnHolder pgn = new PgnHolder(tempPath.toAbsolutePath().toString());
            pgn.loadPgn(); 
            int cantidadPartidas = pgn.getGames().size(); 
            Files.delete(tempPath);

            if (cantidadPartidas < 1 || cantidadPartidas > 3) {
                throw new PgnInvalidoException("El archivo PGN debe contener entre 1 y 3 partidas.");
            }
            
            return contenidoLimpio;
        } catch (PgnInvalidoException e) {
            throw e;
        } catch (Exception e) {
            throw new PgnInvalidoException("Formato PGN inválido o corrupto. No se pudo leer el archivo.");
        }
    }

    private RespuestaIADTO procesarRespuestaIA(String respuestaJson) {
        try {
            int inicio = respuestaJson.indexOf("{");
            int fin = respuestaJson.lastIndexOf("}");
            
            if (inicio == -1 || fin == -1) {
                throw new ServicioIAException("La IA no devolvió un bloque JSON válido.");
            }
            
            // Extraemos el bloque JSON tal cual viene, sin alterar los saltos de línea
            String cleanJson = respuestaJson.substring(inicio, fin + 1);
            
            // Jackson con ALLOW_UNESCAPED_CONTROL_CHARS procesa los saltos del Markdown sin romper el JSON
            ObjectMapper mapper = com.fasterxml.jackson.databind.json.JsonMapper.builder()
                    .enable(com.fasterxml.jackson.core.json.JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
                    .build();
            
            JsonNode root = mapper.readTree(cleanJson);
            
            String texto = root.path("textoMarkdown").asText();
            List<String> etiquetas = new java.util.ArrayList<>();
            
            if (root.path("etiquetas").isArray()) {
                root.path("etiquetas").forEach(node -> etiquetas.add(node.asText()));
            }
            
            return new RespuestaIADTO(texto, etiquetas);
            
        } catch (Exception e) {
            System.err.println("DEBUG - Error en parser unificado: " + e.getMessage());
            throw new ServicioIAException("Error al procesar la respuesta generada por la IA.");
        }
    }
    
    private String construirPgnDesdeBaseDeDatos(List<String> etiquetas, int cantidad) {
        // Si la IA por algún motivo no detecta etiquetas, usamos un fallback genérico
        String temaBuscado = etiquetas.isEmpty() ? "advantage" : etiquetas.get(0);
        
        System.out.println("DEBUG - Buscando en BD ejercicios para el tema: " + temaBuscado);
        List<Puzzle> puzzles = puzzleRepository.findRandomPuzzlesByTheme(temaBuscado, cantidad);

        if (puzzles.isEmpty()) {
            return "No se encontraron ejercicios en la base de datos para la temática solicitada.";
        }

        StringBuilder pgnBuilder = new StringBuilder();
        int contador = 1;

        for (Puzzle puzzle : puzzles) {
        	pgnBuilder.append("[Event \"Ejercicio ").append(contador).append(" - Tema: ").append(temaBuscado).append(" - Rating: ").append(puzzle.getRating()).append("\"]\n");
            pgnBuilder.append("[Site \"Lichess.org ID: ").append(puzzle.getId()).append("\"]\n");
            pgnBuilder.append("[SetUp \"1\"]\n");
            pgnBuilder.append("[FEN \"").append(puzzle.getFen()).append("\"]\n\n");
            
            pgnBuilder.append(formatearSolucion(puzzle.getFen(), puzzle.getMoves())).append(" *\n\n");
            contador++;
        }

        return pgnBuilder.toString();
    }
    
    private String formatearSolucion(String fen, String uciMoves) {
        Board board = new Board();
        board.loadFromFen(fen);
        
        StringBuilder pgnMoves = new StringBuilder();
        String[] movimientosUci = uciMoves.split(" "); 
        
        String[] partesFen = fen.split(" ");
        int moveNumber = 1; 
        if (partesFen.length == 6) {
            moveNumber = Integer.parseInt(partesFen[5]);
        }

        for (int i = 0; i < movimientosUci.length; i++) {
            String uci = movimientosUci[i];
            Move movimientoLegal = null;

            for (Move move : board.legalMoves()) {
                if (move.toString().equalsIgnoreCase(uci)) {
                    movimientoLegal = move;
                    break;
                }
            }

            if (movimientoLegal != null) {
                if (board.getSideToMove().toString().equals("WHITE")) {
                    pgnMoves.append(moveNumber).append(". ");
                } else if (i == 0) {
                    pgnMoves.append(moveNumber).append("... ");
                }

                // Ahora usamos nuestro propio traductor seguro
                String san = calcularSanSeguro(board, movimientoLegal);
                pgnMoves.append(san).append(" ");
                
                if (board.getSideToMove().toString().equals("WHITE")) {
                    moveNumber++;
                }
            }
        }

        return pgnMoves.toString().trim();
    }

    private String calcularSanSeguro(Board board, Move move) {
        Piece piece = board.getPiece(move.getFrom());
        Piece captured = board.getPiece(move.getTo());
        boolean isCapture = captured != null && !captured.toString().equals("NONE");
        
        String fromStr = move.getFrom().toString().toLowerCase(); // ej: "e2"
        String toStr = move.getTo().toString().toLowerCase();     // ej: "e4"

        // 1. Enroques
        if (piece.toString().endsWith("KING") && Math.abs(fromStr.charAt(0) - toStr.charAt(0)) > 1) {
            board.doMove(move);
            boolean jaque = board.isKingAttacked();
            String enroque = toStr.charAt(0) == 'g' ? "O-O" : "O-O-O";
            if (jaque) {
                return enroque + (board.legalMoves().isEmpty() ? "#" : "+");
            }
            return enroque;
        }

        StringBuilder san = new StringBuilder();

        // 2. Peones (incluye Captura al Paso automática)
        if (piece.toString().endsWith("PAWN")) {
            if (fromStr.charAt(0) != toStr.charAt(0)) {
                san.append(fromStr.charAt(0)).append("x").append(toStr);
            } else {
                san.append(toStr);
            }
            if (move.getPromotion() != null && !move.getPromotion().toString().equals("NONE")) {
                san.append("=").append(obtenerLetraPieza(move.getPromotion()));
            }
        } 
        // 3. Piezas Mayores
        else {
            san.append(obtenerLetraPieza(piece));
            
            // 4. Desambiguación estricta PGN (ej: Nbd7)
            boolean fileConflict = false;
            boolean rankConflict = false;
            int attackers = 0;

            for (Move legalMove : board.legalMoves()) {
                if (legalMove.getTo().equals(move.getTo()) && board.getPiece(legalMove.getFrom()) == piece && !legalMove.getFrom().equals(move.getFrom())) {
                    attackers++;
                    if (legalMove.getFrom().toString().toLowerCase().charAt(0) == fromStr.charAt(0)) {
                        fileConflict = true;
                    }
                    if (legalMove.getFrom().toString().toLowerCase().charAt(1) == fromStr.charAt(1)) {
                        rankConflict = true;
                    }
                }
            }

            if (attackers > 0) {
                if (!fileConflict) {
                    san.append(fromStr.charAt(0));
                } else if (!rankConflict) {
                    san.append(fromStr.charAt(1));
                } else {
                    san.append(fromStr);
                }
            }

            if (isCapture) {
                san.append("x");
            }
            san.append(toStr);
        }

        // 5. Ejecutar movimiento y chequear Jaque / Mate
        board.doMove(move);
        if (board.isKingAttacked()) {
            if (board.legalMoves().isEmpty()) {
                san.append("#");
            } else {
                san.append("+");
            }
        }

        return san.toString();
    }

    private String obtenerLetraPieza(Piece piece) {
        if (piece == null) return "";
        String p = piece.toString();
        if (p.endsWith("KNIGHT")) return "N";
        if (p.endsWith("BISHOP")) return "B";
        if (p.endsWith("ROOK")) return "R";
        if (p.endsWith("QUEEN")) return "Q";
        if (p.endsWith("KING")) return "K";
        return "";
    }
    
    private String extraerPeoresJugadasConStockfish(MultipartFile file, Alumno alumno) {
        List<JugadaCritica> errores = new java.util.ArrayList<>();
        String nombre = alumno.getNombre().toLowerCase();
        String apellido = alumno.getApellido().toLowerCase();

        try {
            byte[] bytes = file.getBytes();
            Path tempPath = Files.createTempFile("analisis", ".pgn");
            Files.write(tempPath, bytes);
            
            PgnHolder pgn = new PgnHolder(tempPath.toAbsolutePath().toString());
            pgn.loadPgn();
            
            for (com.github.bhlangonijr.chesslib.game.Game game : pgn.getGames()) {
                String nombreBlancas = game.getWhitePlayer().getName().toLowerCase();
                String nombreNegras = game.getBlackPlayer().getName().toLowerCase();
                
                boolean juegaBlancas = nombreBlancas.contains(nombre) || nombreBlancas.contains(apellido);
                boolean juegaNegras = nombreNegras.contains(nombre) || nombreNegras.contains(apellido);
                
                if (!juegaBlancas && !juegaNegras) {
                    throw new PgnInvalidoException("El alumno " + alumno.getNombre() + " " + alumno.getApellido() + 
                                                   " no participa en esta partida. Jugadores detectados: " + 
                                                   game.getWhitePlayer().getName() + " vs " + game.getBlackPlayer().getName());
                }
                
                Board board = new Board();
                double evalAnterior = stockfishService.evaluarPosicion(board.getFen(), 10);
                
                for (com.github.bhlangonijr.chesslib.move.Move move : game.getHalfMoves()) {
                    com.github.bhlangonijr.chesslib.Side turnoActual = board.getSideToMove();
                    boolean esTurnoAlumno = (turnoActual == com.github.bhlangonijr.chesslib.Side.WHITE && juegaBlancas) ||
                                            (turnoActual == com.github.bhlangonijr.chesslib.Side.BLACK && juegaNegras);


                    // Guardamos la foto ANTES de mover y el movimiento UCI (ej: "e2e4")
                    String fenAntes = board.getFen();
                    String uciMove = move.toString();

                    board.doMove(move);
                    double evalActual = stockfishService.evaluarPosicion(board.getFen(), 10);
                    
                    if (esTurnoAlumno) {
                        double perdida = evalAnterior + evalActual;
                        if (perdida > 1.5) {
                            errores.add(new JugadaCritica(fenAntes, uciMove, perdida));
                        }
                    }
                    evalAnterior = evalActual;
                }
            }
            Files.delete(tempPath);
        } catch (PgnInvalidoException e) {
            throw e; // <-- Dejamos pasar nuestro error 400 intacto
        } catch (Exception e) {
            throw new MotorAnalisisException("Error interno al evaluar las partidas con el motor táctico local.");
        }
        
        // Obtenemos el top 5
        List<JugadaCritica> peoresJugadas = errores.stream()
                .sorted((a, b) -> Double.compare(b.perdida(), a.perdida()))
                .limit(5)
                .toList();

        if (peoresJugadas.isEmpty()) {
            return "No se detectaron errores graves en las partidas analizadas.";
        }

        // Construimos el PGN final
        StringBuilder pgnBuilder = new StringBuilder();
        int contador = 1;

        for (JugadaCritica jc : peoresJugadas) {
            // Usamos Locale.US para que los decimales usen punto (ej: 3.5) y no coma
            pgnBuilder.append("[Event \"Error ").append(contador)
                      .append(" - Pérdida: ").append(String.format(java.util.Locale.US, "%.1f", jc.perdida())).append(" puntos\"]\n");
            pgnBuilder.append("[Site \"Análisis IA del Club\"]\n");
            pgnBuilder.append("[SetUp \"1\"]\n");
            pgnBuilder.append("[FEN \"").append(jc.fenPrevio()).append("\"]\n\n");

            // Instanciamos un tablero temporal para usar el traductor SAN seguro
            Board tempBoard = new Board();
            tempBoard.loadFromFen(jc.fenPrevio());

            com.github.bhlangonijr.chesslib.move.Move mov = null;
            for (com.github.bhlangonijr.chesslib.move.Move m : tempBoard.legalMoves()) {
                if (m.toString().equalsIgnoreCase(jc.uciMove())) {
                    mov = m;
                    break;
                }
            }

            if (mov != null) {
                String turn = tempBoard.getSideToMove().toString();
                String[] partesFen = jc.fenPrevio().split(" ");
                int moveNumber = partesFen.length == 6 ? Integer.parseInt(partesFen[5]) : 1;

                if (turn.equals("WHITE")) {
                    pgnBuilder.append(moveNumber).append(". ");
                } else {
                    pgnBuilder.append(moveNumber).append("... ");
                }

                String san = calcularSanSeguro(tempBoard, mov);
                pgnBuilder.append(san).append(" *\n\n");
            }
            contador++;
        }

        return pgnBuilder.toString();
    }

}
