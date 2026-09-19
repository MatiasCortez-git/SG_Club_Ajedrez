package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.UsuarioRequestDTO;
import com.clubajedrez.backend.dtos.UsuarioResponseDTO;

public interface UsuarioService {
	
	public List<UsuarioResponseDTO> obtenerTodos();
	
	public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto);
	
	public void eliminarUsuario(Integer id);

}
