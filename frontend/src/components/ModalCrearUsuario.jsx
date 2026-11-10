import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const ModalCrearUsuario = ({ show, handleClose, refreshUsuarios }) => {
  const [modo, setModo] = useState('existente');
  const [esProfesor, setEsProfesor] = useState(false);
  const [profesores, setProfesores] = useState([]);
  
  // Estado de Carga Bloqueante
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errores, setErrores] = useState({});

  const validaciones = {
    nombre: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, msj: 'Solo letras y espacios.' },
    apellido: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, msj: 'Solo letras y espacios.' },
    dni: { regex: /^\d{8}$/, msj: 'Debe tener exactamente 8 números.' },
    email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msj: 'Email inválido.' },
    telefono: { regex: /^\d{8,15}$/, msj: 'Entre 8 y 15 dígitos numéricos.' },
    username: { regex: /^[a-zA-Z0-9_.-]{4,20}$/, msj: 'Sin espacios. Entre 4 y 20 letras, números, puntos o guiones.' },
    codFederacion: { regex: /^\d{6,8}$/, msj: 'Entre 6 y 8 números.' },
    elo: { regex: /^\d{3,4}$/, msj: 'Entre 3 y 4 números.' }
  };

  // 1. Eliminación Visual del Input (estado limpiado de 'password')
  const [formData, setFormData] = useState({
    idPersona: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    codFederacion: '',
    elo: '',
    username: '',
    rol: 'ROLE_PROFESOR'
  });
  
  useEffect(() => {
    if (show) {
      // Limpiamos los datos en memoria cada vez que se abre el modal
      setFormData({
        idPersona: '',
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        codFederacion: '',
        elo: '',
        username: '',
        rol: 'ROLE_PROFESOR'
      });

      api.get('/profesores/sin-usuario')
        .then(res => setProfesores(res.data))
        .catch(err => {
          // Amortiguador silencioso: api.js ataja errores de red
        });    
    }
  }, [show]);

 const handleChange = (e) => {
    const { name, value } = e.target;
    let valorSaneado = value;

    // Bloqueo físico de teclado
    if (['dni', 'telefono', 'codFederacion', 'elo'].includes(name)) {
      valorSaneado = valorSaneado.replace(/\D/g, '');
      if (name === 'dni' && valorSaneado.length > 8) return;
      if (name === 'telefono' && valorSaneado.length > 15) return;
      if (name === 'codFederacion' && valorSaneado.length > 8) return;
      if (name === 'elo' && valorSaneado.length > 4) return;
    }
    if (name === 'nombre' || name === 'apellido') {
      valorSaneado = valorSaneado.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    if (name === 'username') {
      valorSaneado = valorSaneado.replace(/\s/g, '');
    }

    setFormData({ ...formData, [name]: valorSaneado });

    // Validación reactiva
    if (valorSaneado.trim() === '') {
      // idPersona y rol se manejan por selects, no necesitan validación inline
      if (name !== 'idPersona' && name !== 'rol') {
        setErrores({ ...errores, [name]: 'Obligatorio.' });
      }
    } else if (validaciones[name] && !validaciones[name].regex.test(valorSaneado)) {
      setErrores({ ...errores, [name]: validaciones[name].msj });
    } else {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[name];
      setErrores(nuevosErrores);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modo === 'existente') {
        // RUTA 1: Profesor ya existente. Solo creamos credenciales (UsuarioRequestDTO).
        const payloadUsuario = {
          idPersona: formData.idPersona,
          username: formData.username,
          rol: 'ROLE_PROFESOR'
        };
        await api.post('/usuarios', payloadUsuario);

      } else if (modo === 'nuevo' && esProfesor) {
        // RUTA 2: Nuevo Profesor. Requiere dos pasos.
        const payloadProfesor = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          codFederacion: formData.codFederacion,
          elo: parseInt(formData.elo)
        };
        const resProfesor = await api.post('/profesores', payloadProfesor);
        
        const payloadUsuario = {
          idPersona: resProfesor.data.idPersona || resProfesor.data.id,
          username: formData.username,
          rol: 'ROLE_PROFESOR'
        };
        await api.post('/usuarios', payloadUsuario);

      } else if (modo === 'nuevo' && !esProfesor) {
        // RUTA 3: Nuevo Personal (Staff). Un solo endpoint hace todo (UsuarioPersonalCreateDTO).
        const payloadPersonal = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          username: formData.username
        };
        await api.post('/usuarios/personal', payloadPersonal);
      }

      Swal.fire(
        'Operación completada', 
        'Usuario creado con éxito. Las credenciales de acceso han sido enviadas automáticamente al correo electrónico registrado.', 
        'success'
      );
      
      refreshUsuarios();
      handleClose();

    } catch (error) {
      // Amortiguador silencioso: api.js atajará errores de validación (400) o duplicados (409)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!show) return null;

  const isFormValid = (() => {
    // 1. El Username es obligatorio en TODOS los modos
    if (String(formData.username || '').trim() === '') return false;
    
    // 2. Si hay cualquier error de Regex activo, bloqueamos
    if (Object.keys(errores).length > 0) return false;

    // 3. Validación según la pestaña activa
    if (modo === 'existente') {
      return String(formData.idPersona || '') !== '';
    } else {
      // Modo Nuevo (Requiere identidad física completa)
      const baseFisicaValida = 
        String(formData.nombre || '').trim() !== '' && 
        String(formData.apellido || '').trim() !== '' && 
        String(formData.dni || '').trim() !== '' && 
        String(formData.email || '').trim() !== '' && 
        String(formData.telefono || '').trim() !== '';

      if (!baseFisicaValida) return false;

      // Si es profesor nuevo, exige también los datos federativos
      if (esProfesor) {
        return String(formData.codFederacion || '').trim() !== '' && 
               String(formData.elo || '').trim() !== '';
      }

      return true; // Es Staff nuevo y la base física está completa
    }
  })();

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-primary">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Alta de Nuevo Usuario</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            
            <div className="mb-4 text-center">
              <div className="btn-group" role="group">
                <input type="radio" className="btn-check" name="btnradio" id="btnExistente" autoComplete="off" 
                  checked={modo === 'existente'} onChange={() => setModo('existente')} disabled={isSubmitting} />
                <label className="btn btn-outline-primary" htmlFor="btnExistente">Vincular Existente</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnNuevo" autoComplete="off" 
                  checked={modo === 'nuevo'} onChange={() => setModo('nuevo')} disabled={isSubmitting} />
                <label className="btn btn-outline-primary" htmlFor="btnNuevo">Crear Identidad Nueva</label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              
              <h6 className="text-secondary border-bottom pb-2 mb-3">1. Identidad Física</h6>
              
              {modo === 'existente' ? (
                <div className="mb-3">
                  <label className="form-label">Seleccionar Persona</label>
                  <select className="form-select" name="idPersona" onChange={handleChange} required disabled={isSubmitting}>
                    <option value="">-- Buscar en el padrón --</option>
                    {profesores.map(prof => (
                      <option key={prof.idPersona} value={prof.idPersona}>
                        {prof.nombre} {prof.apellido} (DNI: {prof.dni})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <input type="text" className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required disabled={isSubmitting} />
                      {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    </div>
                    <div className="col-6">
                      <input type="text" className={`form-control ${errores.apellido ? 'is-invalid' : ''}`} name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required disabled={isSubmitting} />
                      {errores.apellido && <div className="invalid-feedback">{errores.apellido}</div>}
                    </div>
                  </div>
                  <div className="mb-2">
                    <input type="text" className={`form-control ${errores.dni ? 'is-invalid' : ''}`} name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required disabled={isSubmitting} />
                    {errores.dni && <div className="invalid-feedback">{errores.dni}</div>}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Email de Contacto</label>
                      <input type="email" className={`form-control ${errores.email ? 'is-invalid' : ''}`} name="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} />
                      {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className={`form-control ${errores.telefono ? 'is-invalid' : ''}`} name="telefono" value={formData.telefono} onChange={handleChange} required disabled={isSubmitting} />
                      {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                    </div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="esProfesorSwitch" 
                      checked={esProfesor} onChange={(e) => setEsProfesor(e.target.checked)} disabled={isSubmitting} />
                    <label className="form-check-label fw-bold text-primary" htmlFor="esProfesorSwitch">
                      ¿Esta persona es Profesor/Jugador Federado?
                    </label>
                  </div>

                  {esProfesor && (
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <input type="text" className={`form-control border-warning ${errores.codFederacion ? 'is-invalid' : ''}`} name="codFederacion" placeholder="Cód. Federación (Req)" value={formData.codFederacion} onChange={handleChange} required disabled={isSubmitting} />
                        {errores.codFederacion && <div className="invalid-feedback">{errores.codFederacion}</div>}
                      </div>
                      <div className="col-md-6">
                        <input type="text" className={`form-control border-warning ${errores.elo ? 'is-invalid' : ''}`} name="elo" placeholder="Puntaje ELO (Req)" value={formData.elo} onChange={handleChange} required disabled={isSubmitting} />
                        {errores.elo && <div className="invalid-feedback">{errores.elo}</div>}
                      </div>
                    </div>
                  )}
                </>
              )}

              <h6 className="text-secondary border-bottom pb-2 mb-3 mt-4">2. Credenciales de Acceso</h6>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre de Usuario (Acceso)</label>
                <input 
                  type="text" 
                  className={`form-control ${errores.username ? 'is-invalid' : ''}`} 
                  name="username" 
                  placeholder="ej: profe_juan" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting} 
                />
                {errores.username && <div className="invalid-feedback">{errores.username}</div>}
              </div>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isFormValid}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    'Crear Credencial'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;