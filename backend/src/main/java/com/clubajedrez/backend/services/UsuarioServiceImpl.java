package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.UsuarioRequestDTO;
import com.clubajedrez.backend.dtos.UsuarioResponseDTO;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService{ // Puedes implementar la interfaz UsuarioService si la creaste

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        usuario.setRol(dto.getRol());
        usuario.setNombreCompleto(dto.getNombreCompleto());
        
        // REGLA CRÍTICA: Encriptar la contraseña antes de guardarla
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return mapToDTO(usuarioGuardado);
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }

    // Método auxiliar de mapeo
    private UsuarioResponseDTO mapToDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setUsername(usuario.getUsername());
        dto.setRol(usuario.getRol());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        return dto;
    }
}
