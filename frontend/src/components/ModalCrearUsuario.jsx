import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const ModalCrearUsuario = ({ show, handleClose, refreshUsuarios }) => {
  const [modo, setModo] = useState('existente');
  const [esProfesor, setEsProfesor] = useState(false);
  const [profesores, setProfesores] = useState([]);
  
  // 3. Estado de Carga Bloqueante
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      api.get('/profesores')
        .then(res => setProfesores(res.data))
        .catch(err => {
          // Amortiguador silencioso: api.js ataja errores de red
        });    
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-control" name="nombre" onChange={handleChange} required disabled={isSubmitting} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellido</label>
                      <input type="text" className="form-control" name="apellido" onChange={handleChange} required disabled={isSubmitting} />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">DNI</label>
                      <input type="text" className="form-control" name="dni" onChange={handleChange} required disabled={isSubmitting} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-control" name="telefono" onChange={handleChange} disabled={isSubmitting} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email de Contacto</label>
                      <input type="email" className="form-control" name="email" onChange={handleChange} required disabled={isSubmitting} />
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
                    <div className="row g-2 mb-4 bg-light p-3 rounded border">
                      <div className="col-md-6">
                        <label className="form-label">Código Federación (FIDE)</label>
                        <input type="text" className="form-control" name="codFederacion" onChange={handleChange} required={esProfesor} disabled={isSubmitting} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Puntaje ELO</label>
                        <input type="number" className="form-control" name="elo" onChange={handleChange} required={esProfesor} disabled={isSubmitting} />
                      </div>
                    </div>
                  )}
                </>
              )}

              <h6 className="text-secondary border-bottom pb-2 mb-3 mt-4">2. Credenciales de Acceso</h6>
              
              <div className="row g-2 mb-3">
                <div className="col-md-12">
                  <label className="form-label">Nombre de Usuario</label>
                  <input type="text" className="form-control" name="username" onChange={handleChange} required disabled={isSubmitting} />
                </div>
              </div>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {/* Cambio dinámico del botón según el estado de carga */}
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