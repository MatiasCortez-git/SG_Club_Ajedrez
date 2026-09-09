import { useState, useEffect } from 'react';
import api from '../api'; // <-- Agregamos nuestro interceptor

const VistaAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const estadoInicial = {
    nombre: '', apellido: '', dni: '', email: '', 
    telefono: '', fechaNacimiento: '', codFederacion: '', elo: ''
  };
  const [formData, setFormData] = useState(estadoInicial);

  // GET: Cargar alumnos
  const fetchAlumnos = async () => {
    try {
      // Axios ya asume la URL base y te devuelve el JSON listo en res.data
      const res = await api.get('/alumnos');
      setAlumnos(res.data);
    } catch (err) {
      console.error('Error al cargar alumnos', err);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // POST o PUT: Guardar o Editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing) {
        await api.put(`/alumnos/${currentId}`, formData);
        alert('¡Alumno actualizado!');
      } else {
        await api.post('/alumnos', formData);
        alert('¡Alumno registrado!');
      }
      
      setFormData(estadoInicial);
      setIsEditing(false);
      setCurrentId(null);
      fetchAlumnos();
    } catch (err) {
      setError('Error al procesar la solicitud. Verificá los datos.');
    }
  };

  // Cargar datos en el formulario para editar
  const handleEdit = (alumno) => {
    setFormData({
      ...estadoInicial, // Asegura que no queden campos undefined
      ...alumno
    });
    setIsEditing(true);
    setCurrentId(alumno.idPersona);
  };

// DELETE: Baja lógica
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de dar de baja a este alumno?')) return;
    try {
      await api.delete(`/alumnos/${id}`);
      alert('Alumno dado de baja exitosamente.');
      fetchAlumnos();
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Gestión de Alumnos</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Formulario (Izquierda) */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}</h5>
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
                <input type="date" className="form-control mb-2" name="fechaNacimiento" value={formData.fechaNacimiento || ''} onChange={handleChange} required />
                
                {/* Campos Opcionales de Federación */}
                <h6 className="mt-3 text-secondary">Datos Federativos (Opcional)</h6>
                <input type="text" className="form-control mb-2 border-info" name="codFederacion" placeholder="Cod. Federación" value={formData.codFederacion || ''} onChange={handleChange} />
                <input type="number" className="form-control mb-3 border-info" name="elo" placeholder="Puntaje ELO" value={formData.elo || ''} onChange={handleChange} />
                
                <button type="submit" className={`btn w-100 ${isEditing ? 'btn-warning text-dark fw-bold' : 'btn-primary'}`}>
                  {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
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
                  <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Teléfono</th>
                    <th>Cod. Fed</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.length === 0 ? (
                    <tr><td colSpan="5" className="py-4 text-muted">No hay alumnos cargados.</td></tr>
                  ) : (
                    alumnos.map(a => (
                      <tr key={a.idPersona}>
                        <td className="fw-bold">{a.nombre} {a.apellido}</td>
                        <td>{a.dni}</td>
                        <td>{a.telefono}</td>
                        <td>
                          {a.codFederacion ? (
                            <span className="badge bg-success">{a.codFederacion}</span>
                          ) : (
                            <span className="badge bg-secondary">Recreativo</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(a)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.idPersona)}>Baja</button>
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

export default VistaAlumnos;