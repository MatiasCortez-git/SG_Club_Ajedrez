package com.clubajedrez.backend.dtos;
import lombok.Data;

@Data
public class UsuarioResponseDTO {
	
	private Integer idUsuario;
    private String username;
    private String rol;
    private String nombreCompleto;

}
