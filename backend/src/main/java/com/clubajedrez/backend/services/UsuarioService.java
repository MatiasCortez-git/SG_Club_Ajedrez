package com.clubajedrez.backend.services;

import java.util.List;

import com.clubajedrez.backend.dtos.DatosContactoDTO;
import com.clubajedrez.backend.dtos.UsuarioPersonalCreateDTO;
import com.clubajedrez.backend.dtos.UsuarioRequestDTO;
import com.clubajedrez.backend.dtos.UsuarioResponseDTO;

public interface UsuarioService {
	
	public List<UsuarioResponseDTO> obtenerTodos();
	
	public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto);
	
	public void eliminarUsuario(Integer id);
	
	public void actualizarContacto(String username, DatosContactoDTO dto);
	
	public UsuarioResponseDTO crearPersonal(UsuarioPersonalCreateDTO dto);
	
}
