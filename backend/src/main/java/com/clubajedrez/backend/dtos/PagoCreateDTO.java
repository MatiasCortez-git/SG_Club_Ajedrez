package com.clubajedrez.backend.dtos;

import lombok.Data;
import java.util.List;

@Data
public class PagoCreateDTO {
    private Integer idAlumno;
    private String medioPago;
    private List<Integer> idsCuotasAPagar; // Lista explícita de las cuotas a saldar
}