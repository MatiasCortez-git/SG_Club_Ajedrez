package com.clubajedrez.backend.services;

import com.clubajedrez.backend.dtos.DatosContactoDTO;
import com.clubajedrez.backend.dtos.UsuarioPersonalCreateDTO;
import com.clubajedrez.backend.dtos.UsuarioRequestDTO;
import com.clubajedrez.backend.dtos.UsuarioResponseDTO;
import com.clubajedrez.backend.entities.Persona;
import com.clubajedrez.backend.entities.Usuario;
import com.clubajedrez.backend.exceptions.CuentaInactivaException;
import com.clubajedrez.backend.exceptions.PersonaNoEncontradaException;
import com.clubajedrez.backend.exceptions.UsuarioDuplicadoException;
import com.clubajedrez.backend.exceptions.UsuarioNoEncontradoException;
import com.clubajedrez.backend.repositories.PersonaRepository;
import com.clubajedrez.backend.repositories.ProfesorRepository;
import com.clubajedrez.backend.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService{ // Puedes implementar la interfaz UsuarioService si la creaste

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PersonaRepository personaRepository;
    private final ProfesorRepository profesorRepository;
    private final EmailService emailService;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
                              PasswordEncoder passwordEncoder,
                              PersonaRepository personaRepository,
                              ProfesorRepository profesorRepository,
                              EmailService emailService) { 
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.personaRepository = personaRepository;
        this.profesorRepository = profesorRepository;
        this.emailService = emailService;
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
    	// Validar que la persona no posea ya una cuenta
        if (usuarioRepository.existsByPersona_IdPersona(dto.getIdPersona())) {
            throw new UsuarioDuplicadoException("La persona física requerida ya posee una cuenta de acceso asignada.");
        }
        
        // Lista blanca de roles (Sin portal de alumnos)
        if (!dto.getRol().equals("ROLE_ADMIN") && !dto.getRol().equals("ROLE_PROFESOR")) {
            throw new IllegalArgumentException("Operación rechazada: El sistema no posee portal de autogestión para alumnos. Solo se permiten accesos de administración o docencia.");
        }
        
        // Si se otorga acceso de docente, la persona DEBE ser un profesor físico
        if (dto.getRol().equals("ROLE_PROFESOR") && !profesorRepository.existsById(dto.getIdPersona())) {
        	throw new IllegalArgumentException("Incoherencia de datos: No se puede otorgar credenciales de profesor a una persona que no está registrada como docente en el club.");
        } 
    	
    	// 2. Buscamos a la persona física que será dueña de esta cuenta
    	Persona persona = personaRepository.findById(dto.getIdPersona())
                .orElseThrow(() -> new PersonaNoEncontradaException("La persona física requerida no existe en el sistema."));
    	
    	// Generamos la contraseña temporal ANTES de armar el usuario
        String passwordGenerada = generarPasswordAleatorio();
    	
    	// 3. Armamos la entidad de acceso
    	Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        usuario.setRol(dto.getRol());
        usuario.setPersona(persona);
        
        // REGLA CRÍTICA: Encriptar la contraseña antes de guardarla
        usuario.setPassword(passwordEncoder.encode(passwordGenerada));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        
        // 5. ENVIAR CORREO (Enviamos la plana, no el hash)
        emailService.enviarCredenciales(persona.getEmail(), usuario.getUsername(), passwordGenerada);
        
        return mapToDTO(usuarioGuardado);
    }

    public void eliminarUsuario(Integer id) {
    	Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario inexistente."));
        usuario.setIsActive(false);
        usuarioRepository.save(usuario);
    }
    
    @Override
    @Transactional
    public void actualizarContacto(String username, DatosContactoDTO dto) {
        Usuario usuario = usuarioRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new CuentaInactivaException("Acceso rechazado: Su cuenta de usuario se encuentra inactiva."));

        usuario.getPersona().setTelefono(dto.getTelefono());
        usuario.getPersona().setEmail(dto.getEmail());
        
        usuarioRepository.save(usuario);
    }
    
    @Override
    @Transactional
    public UsuarioResponseDTO crearPersonal(UsuarioPersonalCreateDTO dto) {
        
        // 1. Validar unicidad del username
        if (usuarioRepository.findByUsernameAndIsActiveTrue(dto.getUsername()).isPresent()) {
            throw new UsuarioDuplicadoException("El nombre de usuario ya se encuentra registrado.");
        }

        // 2. Instanciar y persistir la identidad física
        Persona nuevaPersona = new Persona();
        nuevaPersona.setNombre(dto.getNombre());
        nuevaPersona.setApellido(dto.getApellido());
        nuevaPersona.setDni(dto.getDni());
        nuevaPersona.setEmail(dto.getEmail());
        nuevaPersona.setTelefono(dto.getTelefono());
        
        Persona personaGuardada = personaRepository.save(nuevaPersona);
        
        // Generamos la contraseña temporal ANTES de armar el usuario
        String passwordGenerada = generarPasswordAleatorio();

        // 3. Construir la credencial vinculándola a la persona física
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(dto.getUsername());
        nuevoUsuario.setRol("ROLE_STAFF");
        nuevoUsuario.setPersona(personaGuardada);
        
        // 4. Encriptar la contraseña de forma obligatoria
        nuevoUsuario.setPassword(passwordEncoder.encode(passwordGenerada));

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
        
        // 5. ENVIAR CORREO (Enviamos la plana, no el hash)
        emailService.enviarCredenciales(personaGuardada.getEmail(), usuarioGuardado.getUsername(), passwordGenerada);
        
        return mapToDTO(usuarioGuardado);
    }
    
    private String generarPasswordAleatorio() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new  SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        return sb.toString();
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
