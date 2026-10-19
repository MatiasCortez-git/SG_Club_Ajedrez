package com.clubajedrez.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clubajedrez.backend.dtos.DeudaAlumnoDTO;
import com.clubajedrez.backend.dtos.EstadisticaDemografiaDTO;
import com.clubajedrez.backend.dtos.EstadisticaOcupacionDTO;
import com.clubajedrez.backend.dtos.EstadisticaRecaudacionDTO;
import com.clubajedrez.backend.dtos.RankingEloDTO;
import com.clubajedrez.backend.entities.Alumno;
import com.clubajedrez.backend.entities.AlumnoTaller;
import com.clubajedrez.backend.entities.Cuota;
import com.clubajedrez.backend.entities.DetalleCuota;
import com.clubajedrez.backend.entities.Federado;
import com.clubajedrez.backend.entities.Taller;
import com.clubajedrez.backend.repositories.AlumnoTallerRepository;
import com.clubajedrez.backend.repositories.CuotaRepository;
import com.clubajedrez.backend.repositories.FederadoRepository;
import com.clubajedrez.backend.repositories.TallerRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    private final FederadoRepository federadoRepository;
    private final CuotaRepository cuotaRepository;
    private final TallerRepository tallerRepository;
    private final AlumnoTallerRepository alumnoTallerRepository;

    public ReporteServiceImpl(FederadoRepository federadoRepository,
    		CuotaRepository cuotaRepository,
    		TallerRepository tallerRepository,
    		AlumnoTallerRepository alumnoTallerRepository
    		) {
        this.federadoRepository = federadoRepository;
        this.cuotaRepository = cuotaRepository;
        this.tallerRepository = tallerRepository;
        this.alumnoTallerRepository = alumnoTallerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RankingEloDTO> obtenerRankingElo() {
        // Obtenemos los federados ya ordenados desde PostgreSQL
        List<Federado> federados = federadoRepository.findByIsActiveTrueOrderByEloDesc();
        
        return federados.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<DeudaAlumnoDTO> obtenerAlumnosMorosos() {
        // 1. Traer todas las cuotas impagas
        List<Cuota> cuotasPendientes = cuotaRepository.findByEstado("Pendiente");

        // 2. Usar un mapa para agrupar las deudas por DNI
        Map<String, DeudaAlumnoDTO> mapaDeudas = new HashMap<>();

        for (Cuota cuota : cuotasPendientes) {
            Alumno alumno = cuota.getAlumno();
            String dni = alumno.getDni();

            // Sumar el total de ESTA cuota leyendo sus detalles inmutables
            BigDecimal totalCuota = cuota.getDetalles().stream()
                    .map(DetalleCuota::getMontoCongelado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 3. Agrupar: Si el alumno ya está en el mapa, le sumamos el monto. Si no, lo creamos.
            if (mapaDeudas.containsKey(dni)) {
                DeudaAlumnoDTO dtoExistente = mapaDeudas.get(dni);
                dtoExistente.setMontoAdeudado(dtoExistente.getMontoAdeudado().add(totalCuota));
            } else {
                DeudaAlumnoDTO nuevoDto = new DeudaAlumnoDTO();
                nuevoDto.setNombreCompleto(alumno.getNombre() + " " + alumno.getApellido());
                nuevoDto.setDni(dni);
                nuevoDto.setMontoAdeudado(totalCuota);
                mapaDeudas.put(dni, nuevoDto);
            }
        }

        // 4. Retornar los valores del mapa como una lista
        return new ArrayList<>(mapaDeudas.values());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaOcupacionDTO> obtenerEstadisticasOcupacion() {
        // 1. Traemos todos los talleres activos[cite: 27]
        List<Taller> talleres = tallerRepository.findByIsActiveTrue();
        List<EstadisticaOcupacionDTO> estadisticas = new ArrayList<>();

        for (Taller taller : talleres) {
            EstadisticaOcupacionDTO dto = new EstadisticaOcupacionDTO();
            dto.setNombreTaller(taller.getNombre());
            dto.setNivel(taller.getNivel());
            dto.setCupoMaximo(taller.getCupoMaximo());

            // 2. Extraemos inscriptos y calculamos porcentaje
            long inscriptos = alumnoTallerRepository.countByTaller_IdTaller(taller.getIdTaller());
            dto.setInscriptosReales(inscriptos);
            
            double porcentaje = 0.0;
            if (taller.getCupoMaximo() > 0) {
                porcentaje = ((double) inscriptos / taller.getCupoMaximo()) * 100;
            }
            // Redondeamos a 2 decimales
            dto.setPorcentajeOcupacion(Math.round(porcentaje * 100.0) / 100.0);

            // 3. Calculamos la rentabilidad total
            BigDecimal rentabilidad = alumnoTallerRepository.calcularRentabilidadPorTaller(taller.getIdTaller());
            dto.setRentabilidadProyectada(rentabilidad != null ? rentabilidad : BigDecimal.ZERO);

            estadisticas.add(dto);
        }

        return estadisticas;
    }

    @Override
    public byte[] generarCsvOcupacion() {
        List<EstadisticaOcupacionDTO> datos = obtenerEstadisticasOcupacion();
        StringBuilder csvContent = new StringBuilder();
        
        // Cabeceras con punto y coma
        csvContent.append("Taller;Nivel;Cupo Maximo;Inscriptos Reales;Ocupacion (%);Rentabilidad Proyectada ($)\n");
        
        for (EstadisticaOcupacionDTO dto : datos) {
            // Formateo de decimales para Excel regional
            String ocupacionStr = String.valueOf(dto.getPorcentajeOcupacion()).replace(".", ",");
            String rentabilidadStr = String.valueOf(dto.getRentabilidadProyectada()).replace(".", ",");

            // Concatenación usando punto y coma
            csvContent.append(dto.getNombreTaller()).append(";")
                      .append(dto.getNivel()).append(";")
                      .append(dto.getCupoMaximo()).append(";")
                      .append(dto.getInscriptosReales()).append(";")
                      .append(ocupacionStr).append(";")
                      .append(rentabilidadStr).append("\n");
        }

        return csvContent.toString().getBytes();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaRecaudacionDTO> obtenerEstadisticasRecaudacion() {
        // 1. Obtenemos todas las cuotas de la base de datos
        List<Cuota> todasLasCuotas = cuotaRepository.findAll();

        // 2. Agrupamos las cuotas usando el periodo (ej: "2026-07") como clave
        Map<String, List<Cuota>> cuotasPorPeriodo = todasLasCuotas.stream()
                .collect(Collectors.groupingBy(Cuota::getPeriodo));

        List<EstadisticaRecaudacionDTO> estadisticas = new ArrayList<>();

        for (Map.Entry<String, List<Cuota>> entry : cuotasPorPeriodo.entrySet()) {
            EstadisticaRecaudacionDTO dto = new EstadisticaRecaudacionDTO();
            dto.setPeriodo(entry.getKey());

            BigDecimal cobrado = BigDecimal.ZERO;
            BigDecimal pendiente = BigDecimal.ZERO;
            long cantPagadas = 0;
            long cantPendientes = 0;

            // 3. Iteramos las cuotas de ese mes específico
            for (Cuota c : entry.getValue()) {
                BigDecimal totalCuota = c.getDetalles().stream()
                        .map(DetalleCuota::getMontoCongelado)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if ("Pagada".equalsIgnoreCase(c.getEstado())) {
                    cobrado = cobrado.add(totalCuota);
                    cantPagadas++;
                } else { // Si es Pendiente o Vencida
                    pendiente = pendiente.add(totalCuota);
                    cantPendientes++;
                }
            }

            dto.setIngresosCobrados(cobrado);
            dto.setCapitalRetenido(pendiente);
            dto.setCuotasPagadas(cantPagadas);
            dto.setCuotasPendientes(cantPendientes);

            // 4. Calculamos la tasa de éxito de cobro (%)
            double tasa = 0.0;
            long totalCuotas = cantPagadas + cantPendientes;
            if (totalCuotas > 0) {
                tasa = ((double) cantPagadas / totalCuotas) * 100;
            }
            dto.setTasaCobro(Math.round(tasa * 100.0) / 100.0);

            estadisticas.add(dto);
        }

        // 5. Ordenamos por periodo descendente para que el mes más nuevo quede arriba
        estadisticas.sort((a, b) -> b.getPeriodo().compareTo(a.getPeriodo()));

        return estadisticas;
    }

    @Override
    public byte[] generarCsvRecaudacion() {
        List<EstadisticaRecaudacionDTO> datos = obtenerEstadisticasRecaudacion();
        StringBuilder csvContent = new StringBuilder();

        // Cabeceras con punto y coma
        csvContent.append("Periodo;Ingresos Cobrados ($);Capital Retenido ($);Cuotas Pagadas;Cuotas Pendientes;Tasa de Cobro (%)\n");

        for (EstadisticaRecaudacionDTO dto : datos) {
            // Formateo de decimales para Excel regional
            String cobradoStr = String.valueOf(dto.getIngresosCobrados()).replace(".", ",");
            String retenidoStr = String.valueOf(dto.getCapitalRetenido()).replace(".", ",");
            String tasaStr = String.valueOf(dto.getTasaCobro()).replace(".", ",");

            // Concatenación usando punto y coma
            csvContent.append(dto.getPeriodo()).append(";")
                      .append(cobradoStr).append(";")
                      .append(retenidoStr).append(";")
                      .append(dto.getCuotasPagadas()).append(";")
                      .append(dto.getCuotasPendientes()).append(";")
                      .append(tasaStr).append("\n");
        }

        return csvContent.toString().getBytes();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EstadisticaDemografiaDTO> obtenerEstadisticasDemograficas() {
        // 1. Traemos todas las inscripciones activas
        List<AlumnoTaller> inscripciones = alumnoTallerRepository.findAll();

        // 2. Agrupamos por el nivel del taller (Ej: "Principiante")
        Map<String, List<AlumnoTaller>> porNivel = inscripciones.stream()
                .collect(Collectors.groupingBy(at -> at.getTaller().getNivel()));

        List<EstadisticaDemografiaDTO> estadisticas = new ArrayList<>();

        for (Map.Entry<String, List<AlumnoTaller>> entry : porNivel.entrySet()) {
            EstadisticaDemografiaDTO dto = new EstadisticaDemografiaDTO();
            dto.setNivelTaller(entry.getKey());
            dto.setCantidadAlumnos((long) entry.getValue().size());

            // 3. Extraemos y calculamos las edades exactas hoy
            List<Integer> edades = entry.getValue().stream()
                    .map(at -> java.time.Period.between(at.getAlumno().getFechaNacimiento(), java.time.LocalDate.now()).getYears())
                    .collect(Collectors.toList());

            // 4. Calculamos las métricas estadísticas
            double promedio = edades.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            int min = edades.stream().mapToInt(Integer::intValue).min().orElse(0);
            int max = edades.stream().mapToInt(Integer::intValue).max().orElse(0);

            dto.setEdadPromedio(Math.round(promedio * 100.0) / 100.0);
            dto.setEdadMinima(min);
            dto.setEdadMaxima(max);

            estadisticas.add(dto);
        }

        return estadisticas;
    }

    @Override
    public byte[] generarCsvDemografico() {
        List<EstadisticaDemografiaDTO> datos = obtenerEstadisticasDemograficas();
        StringBuilder csv = new StringBuilder();
        
        // 1. Cambiamos las comas por punto y coma (;) en las cabeceras
        csv.append("Nivel del Taller;Cantidad de Alumnos;Edad Promedio;Edad Minima;Edad Maxima\n");

        for (EstadisticaDemografiaDTO dto : datos) {
            
            // 2. Reemplazamos el punto del decimal por una coma nativa para Excel
            String edadPromedioFormateada = String.valueOf(dto.getEdadPromedio()).replace(".", ",");

            // 3. Concatenamos usando punto y coma (;)
            csv.append(dto.getNivelTaller()).append(";")
               .append(dto.getCantidadAlumnos()).append(";")
               .append(edadPromedioFormateada).append(";")
               .append(dto.getEdadMinima()).append(";")
               .append(dto.getEdadMaxima()).append("\n");
        }
        
        return csv.toString().getBytes();
    }

    private RankingEloDTO mapToDTO(Federado federado) {
        RankingEloDTO dto = new RankingEloDTO();
        
        // Atributos heredados de Persona
        dto.setNombreCompleto(federado.getNombre() + " " + federado.getApellido());
        dto.setDni(federado.getDni());
        
        // Atributos propios de Federado
        dto.setCodFederacion(federado.getCodFederacion());
        dto.setElo(federado.getElo());
        
        return dto;
    }
}