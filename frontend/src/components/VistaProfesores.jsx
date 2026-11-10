import { useState, useEffect } from 'react';
import api from '../api'; 
import Swal from 'sweetalert2'; 

const VistaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const rol = sessionStorage.getItem('rol');

   //  Identificamos exactamente quién es el usuario
  const esAdmin = rol === 'ROLE_ADMIN';
  const esProfesor = rol === 'ROLE_PROFESOR';
  const esStaff = rol === 'ROLE_STAFF';

  // Creamos los permisos agrupados
  const puedeEditar = esAdmin;


  const estadoInicial = {
    nombre: '', apellido: '', dni: '', email: '', 
    telefono: '', codFederacion: '', elo: ''
  };
  const [formData, setFormData] = useState(estadoInicial);
  const [errores, setErrores] = useState({});

  const validaciones = {
    nombre: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, msj: 'Solo letras y espacios.' },
    apellido: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, msj: 'Solo letras y espacios.' },
    dni: { regex: /^\d{8}$/, msj: 'Debe tener exactamente 8 números.' },
    telefono: { regex: /^\d{8,15}$/, msj: 'Entre 8 y 15 dígitos numéricos.' },
    email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msj: 'Email inválido.' },
    codFederacion: { regex: /^\d{6,8}$/, msj: 'Debe tener entre 6 y 8 números.' },
    elo: { regex: /^\d{3,4}$/, msj: 'Debe tener entre 3 y 4 números.' }
  };

  const fetchProfesores = async () => {
    try {
      const res = await api.get('/profesores');
      setProfesores(res.data);
    } catch (err) {
      // Amortiguador silencioso: api.js avisará si el servidor está caído
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

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

    setFormData({ ...formData, [name]: valorSaneado });

    if (valorSaneado.trim() === '') {
      if (camposOpcionales.includes(name)) {
        const nuevosErrores = { ...errores };
        delete nuevosErrores[name];
        setErrores(nuevosErrores);
      } else {
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

    try {
      if (isEditing) {
        await api.put(`/profesores/${currentId}`, formData);
        Swal.fire('Operación completada', 'Profesor actualizado correctamente.', 'success');
      } else {
        await api.post('/profesores', formData);
        Swal.fire('Operación completada', 'Profesor registrado correctamente.', 'success');
      }
      
      setFormData(estadoInicial);
      setIsEditing(false);
      setCurrentId(null);
      fetchProfesores();
    } catch (err) {
      // Amortiguador: api.js ataja el 400 Bad Request si el profesor no cumple la regla de federación
    }
  };

  const handleEdit = (profesor) => {
    setFormData({
      ...estadoInicial,
      ...profesor
    });
    setIsEditing(true);
    setCurrentId(profesor.idPersona || profesor.id);
    setErrores({});
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción dará de baja al profesor del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/profesores/${id}`);
          Swal.fire('Operación completada', 'Profesor dado de baja exitosamente.', 'success');
          fetchProfesores();
        } catch (err) {
          // Amortiguador silencioso: api.js mostrará el error si hay un problema
        }
      }
    });
  };

  const isFormValid = 
    String(formData.nombre || '').trim() !== '' && 
    String(formData.apellido || '').trim() !== '' && 
    String(formData.dni || '').trim() !== '' && 
    String(formData.email || '').trim() !== '' && 
    String(formData.telefono || '').trim() !== '' && 
    String(formData.codFederacion || '').trim() !== '' && 
    String(formData.elo || '').trim() !== '' && 
    Object.keys(errores).length === 0;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Gestión de Profesores</h2>
      
      <div className="row">
        {/* Formulario (Izquierda) */}
        {puedeEditar && (
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{isEditing ? 'Editar Profesor' : 'Nuevo Profesor'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input type="text" className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                  </div>
                  <div className="col-6">
                    <input type="text" className={`form-control ${errores.apellido ? 'is-invalid' : ''}`} name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
                    {errores.apellido && <div className="invalid-feedback">{errores.apellido}</div>}
                  </div>
                </div>
                
                <div className="mb-2">
                  <input type="text" className={`form-control ${errores.dni ? 'is-invalid' : ''}`} name="dni" placeholder="DNI" value={formData.dni || ''} onChange={handleChange} required />
                  {errores.dni && <div className="invalid-feedback">{errores.dni}</div>}
                </div>
                
                <div className="mb-2">
                  <input type="email" className={`form-control ${errores.email ? 'is-invalid' : ''}`} name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} required />
                  {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                </div>
                
                <div className="mb-2">
                  <input type="text" className={`form-control ${errores.telefono ? 'is-invalid' : ''}`} name="telefono" placeholder="Teléfono" value={formData.telefono || ''} onChange={handleChange} required />
                  {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                </div>
                
                <h6 className="mt-3 text-secondary">Datos Federativos</h6>
                
                <div className="mb-2">
                  <input type="text" className={`form-control border-warning ${errores.codFederacion ? 'is-invalid' : ''}`} name="codFederacion" placeholder="Cod. Federación (Req)" value={formData.codFederacion || ''} onChange={handleChange} required />
                  {errores.codFederacion && <div className="invalid-feedback">{errores.codFederacion}</div>}
                </div>

                <div className="mb-3">
                  <input type="text" className={`form-control border-warning ${errores.elo ? 'is-invalid' : ''}`} name="elo" placeholder="Puntaje ELO (Req)" value={formData.elo || ''} onChange={handleChange} required />
                  {errores.elo && <div className="invalid-feedback">{errores.elo}</div>}
                </div>
                
                <button type="submit" className={`btn w-100 ${isEditing ? 'btn-warning' : 'btn-primary'}`} disabled={!isFormValid}>
                  {isEditing ? 'Guardar Cambios' : 'Registrar'}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setIsEditing(false); setFormData(estadoInicial); setErrores({}); }}>Cancelar</button>
                )}
              </form>
            </div>
          </div>
        </div>
        )}

        {/* Grilla (Derecha) */}
        <div className={puedeEditar ? "col-md-8" : "col-md-12"}>
          <div className="card shadow-sm">
            <div className="card-body p-0 table-responsive">
              <table className="table table-striped table-hover mb-0 text-center align-middle">
                <thead className="table-light">
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Cod. Fed</th>
                  {puedeEditar && (<th>Acciones</th>)}</tr>
                </thead>
                <tbody>
                  {profesores.length === 0 ? (
                    <tr><td colSpan="5" className="py-4 text-muted">No hay profesores cargados.</td></tr>
                  ) : (
                    profesores.map(p => (
                      <tr key={p.idPersona || p.id}>
                        <td className="fw-bold">{p.nombre} {p.apellido}</td>
                        <td>{p.email}</td>
                        <td>{p.telefono}</td>
                        <td><span className="badge bg-info text-dark">{p.codFederacion || 'N/A'}</span></td>
                        <td>
                          {puedeEditar && (
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(p)}>Editar</button>
                          )}
                          {/* Solo renderiza este botón si el rol es estrictamente ROLE_ADMIN */}
                          {rol === 'ROLE_ADMIN' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.idPersona || p.id)}>Baja</button>
                          )}  
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaProfesores;