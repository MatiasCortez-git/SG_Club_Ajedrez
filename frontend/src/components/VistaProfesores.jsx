import { useState, useEffect } from 'react';
import api from '../api'; 
import Swal from 'sweetalert2'; 

const VistaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const rol = sessionStorage.getItem('rol');

  const estadoInicial = {
    nombre: '', apellido: '', dni: '', email: '', 
    telefono: '', codFederacion: '', elo: ''
  };
  const [formData, setFormData] = useState(estadoInicial);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Gestión de Profesores</h2>
      
      <div className="row">
        {/* Formulario (Izquierda) */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{isEditing ? 'Editar Profesor' : 'Nuevo Profesor'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-2 mb-2">
                  <div className="col-6"><input type="text" className="form-control" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required /></div>
                  <div className="col-6"><input type="text" className="form-control" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required /></div>
                </div>
                <input type="text" className="form-control mb-2" name="dni" placeholder="DNI" value={formData.dni || ''} onChange={handleChange} required />
                <input type="email" className="form-control mb-2" name="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} required />
                <input type="text" className="form-control mb-2" name="telefono" placeholder="Teléfono" value={formData.telefono || ''} onChange={handleChange} required />
                
                <h6 className="mt-3 text-secondary">Datos Federativos</h6>
                <input type="text" className="form-control mb-2 border-warning" name="codFederacion" placeholder="Cod. Federación (Req)" value={formData.codFederacion || ''} onChange={handleChange} required />
                <input type="number" className="form-control mb-3" name="elo" placeholder="Puntaje ELO" value={formData.elo || ''} onChange={handleChange} />
                
                <button type="submit" className={`btn w-100 ${isEditing ? 'btn-warning' : 'btn-primary'}`}>
                  {isEditing ? 'Guardar Cambios' : 'Registrar'}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setIsEditing(false); setFormData(estadoInicial); }}>Cancelar</button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Grilla (Derecha) */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-0 table-responsive">
              <table className="table table-striped table-hover mb-0 text-center align-middle">
                <thead className="table-light">
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Cod. Fed</th><th>Acciones</th></tr>
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
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(p)}>Editar</button>
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