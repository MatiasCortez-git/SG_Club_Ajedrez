import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const ModalCrearUsuario = ({ show, handleClose, refreshUsuarios }) => {
  const [modo, setModo] = useState('existente');
  const [esProfesor, setEsProfesor] = useState(false);
  
  const [profesores, setProfesores] = useState([]);

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
    password: '',
    rol: 'ROLE_PROFESOR' // Rol fijado por defecto
  });
  
  useEffect(() => {
    if (show) {
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
    try {
      let idFisico = formData.idPersona;

      if (modo === 'nuevo') {
        if (esProfesor) {
          const payloadProfesor = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            email: formData.email,
            telefono: formData.telefono,
            codFederacion: formData.codFederacion,
            elo: parseInt(formData.elo)
          };
          const res = await api.post('/profesores', payloadProfesor);
          idFisico = res.data.idPersona;
        } else {
          // TODO: Consumir el endpoint genérico POST /api/v1/personas cuando exista
          Swal.fire('Info', 'El endpoint genérico de personas aún no existe en el backend.', 'info');
          return; 
        }
      }

      // Procedemos a crear la credencial de seguridad con el rol fijo
      const payloadUsuario = {
        idPersona: idFisico,
        username: formData.username,
        password: formData.password,
        rol: 'ROLE_PROFESOR' // Forzamos el rol directamente en el payload
      };

      await api.post('/usuarios', payloadUsuario);
      
      Swal.fire('Operación completada', 'Usuario y credenciales creados correctamente.', 'success');
      refreshUsuarios();
      handleClose();

    } catch (error) {
      // Amortiguador silencioso: api.js atajará errores de validación (400) o duplicados (409)
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-primary">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Alta de Nuevo Usuario</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            
            {/* Selector de Modo */}
            <div className="mb-4 text-center">
              <div className="btn-group" role="group">
                <input type="radio" className="btn-check" name="btnradio" id="btnExistente" autoComplete="off" 
                  checked={modo === 'existente'} onChange={() => setModo('existente')} />
                <label className="btn btn-outline-primary" htmlFor="btnExistente">Vincular Existente</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnNuevo" autoComplete="off" 
                  checked={modo === 'nuevo'} onChange={() => setModo('nuevo')} />
                <label className="btn btn-outline-primary" htmlFor="btnNuevo">Crear Identidad Nueva</label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* BLOQUE A: IDENTIDAD FÍSICA */}
              <h6 className="text-secondary border-bottom pb-2 mb-3">1. Identidad Física</h6>
              
              {modo === 'existente' ? (
                <div className="mb-3">
                  <label className="form-label">Seleccionar Persona</label>
                  <select className="form-select" name="idPersona" onChange={handleChange} required>
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
                      <input type="text" className="form-control" name="nombre" onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellido</label>
                      <input type="text" className="form-control" name="apellido" onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">DNI</label>
                      <input type="text" className="form-control" name="dni" onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-control" name="telefono" onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email de Contacto</label>
                      <input type="email" className="form-control" name="email" onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="esProfesorSwitch" 
                      checked={esProfesor} onChange={(e) => setEsProfesor(e.target.checked)} />
                    <label className="form-check-label fw-bold text-primary" htmlFor="esProfesorSwitch">
                      ¿Esta persona es Profesor/Jugador Federado?
                    </label>
                  </div>

                  {esProfesor && (
                    <div className="row g-2 mb-4 bg-light p-3 rounded border">
                      <div className="col-md-6">
                        <label className="form-label">Código Federación (FIDE)</label>
                        <input type="text" className="form-control" name="codFederacion" onChange={handleChange} required={esProfesor} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Puntaje ELO</label>
                        <input type="number" className="form-control" name="elo" onChange={handleChange} required={esProfesor} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* BLOQUE B: CREDENCIALES DE SISTEMA */}
              <h6 className="text-secondary border-bottom pb-2 mb-3 mt-4">2. Credenciales de Acceso</h6>
              
              {/* Ocultamos el select de Rol y expandimos los campos restantes */}
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Usuario (Email Login)</label>
                  <input type="email" className="form-control" name="username" onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" name="password" onChange={handleChange} required />
                </div>
              </div>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Credencial</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;