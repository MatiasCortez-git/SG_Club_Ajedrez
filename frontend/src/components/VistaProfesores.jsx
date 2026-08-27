import { useState, useEffect } from 'react';

const VistaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const estadoInicial = {
    nombre: '', apellido: '', dni: '', email: '', 
    telefono: '', codFederacion: '', elo: ''
  };
  const [formData, setFormData] = useState(estadoInicial);

  // GET: Cargar profesores
  const fetchProfesores = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/profesores');
      if (res.ok) setProfesores(await res.json());
    } catch (err) {
      console.error('Error al cargar profesores', err);
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // POST o PUT: Guardar o Editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.codFederacion) {
      setError('El Código de Federación es obligatorio.');
      return;
    }

    const url = isEditing 
      ? `http://localhost:8081/api/v1/profesores/${currentId}` 
      : 'http://localhost:8081/api/v1/profesores';
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok || res.status === 201) {
        alert(isEditing ? '¡Profesor actualizado!' : '¡Profesor registrado!');
        setFormData(estadoInicial);
        setIsEditing(false);
        setCurrentId(null);
        fetchProfesores();
      } else {
        setError('Error al procesar la solicitud.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  // Cargar datos en el formulario para editar
  const handleEdit = (profesor) => {
    setFormData(profesor);
    setIsEditing(true);
    setCurrentId(profesor.idPersona || profesor.id);
  };

  // DELETE: Baja lógica
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de dar de baja a este profesor?')) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/profesores/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        alert('Profesor dado de baja exitosamente.');
        fetchProfesores();
      }
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Gestión de Profesores</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

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
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.idPersona || p.id)}>Baja</button>
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