package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.UsuarioRequestDTO;
import com.clubajedrez.backend.dtos.UsuarioResponseDTO;
import com.clubajedrez.backend.entities.Persona;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.exceptions.PersonaNoEncontradaException;
import com.clubajedrez.backend.exceptions.UsuarioDuplicadoException;
import com.clubajedrez.backend.exceptions.UsuarioNoEncontradoException;
import com.clubajedrez.backend.repositories.PersonaRepository;
import com.clubajedrez.backend.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService{ // Puedes implementar la interfaz UsuarioService si la creaste

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PersonaRepository personaRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
    						  PasswordEncoder passwordEncoder,
    						  PersonaRepository personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    
    @Override
    @Transactional
    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto) {
    	
    	// 1. Validamos que el username no exista
    	if (usuarioRepository.findByUsernameAndIsActiveTrue(dto.getUsername()).isPresent()) {
            throw new UsuarioDuplicadoException("El usuario ya existe.");
        }
    	
    	// 2. Buscamos a la persona física que será dueña de esta cuenta
    	Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new PersonaNoEncontradaException("La persona física requerida no existe en el sistema."));
    	
    	// 3. Armamos la entidad de acceso
    	Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        usuario.setRol(dto.getRol());
        usuario.setPersona(persona);
        
        // REGLA CRÍTICA: Encriptar la contraseña antes de guardarla
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return mapToDTO(usuarioGuardado);
    }

    public void eliminarUsuario(Integer id) {
    	Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario inexistente."));
        usuario.setIsActive(false);
        usuarioRepository.save(usuario);
    }

    // Método auxiliar de mapeo
    private UsuarioResponseDTO mapToDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setUsername(usuario.getUsername());
        dto.setRol(usuario.getRol());
        dto.setIdPersona(usuario.getPersona().getIdPersona());
        dto.setNombreCompleto(usuario.getPersona().getApellido()+ " " + usuario.getPersona().getNombre());
        return dto;
    }
}
