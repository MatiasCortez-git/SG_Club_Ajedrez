import { useState, useEffect } from 'react';

const VistaAlumnos = () => {
  // Estado para la grilla y el formulario
  const [alumnos, setAlumnos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
  });

  // GET: Traer alumnos desde Spring Boot
  const fetchAlumnos = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/v1/alumnos');
      if (response.ok) {
        const data = await response.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error de conexión con el backend:', error);
    }
  };

  // Cargar grilla al iniciar
  useEffect(() => {
    fetchAlumnos();
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // POST: Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/v1/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 201) {
        fetchAlumnos(); // Refresca la tabla automáticamente
        setFormData({ nombre: '', apellido: '', dni: '', email: '', telefono: '', fechaNacimiento: '' }); // Limpia form
      } else {
        alert('Error al registrar. Verificá los datos.');
      }
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Gestión de Alumnos</h2>
      
      <div className="row">
        {/* Formulario (Columna Izquierda) */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">Nuevo Alumno</div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {['nombre', 'apellido', 'dni', 'email', 'telefono'].map((campo) => (
                  <div className="mb-3" key={campo}>
                    <label className="form-label text-capitalize">{campo}</label>
                    <input 
                      type={campo === 'email' ? 'email' : 'text'} 
                      className="form-control" 
                      name={campo} 
                      value={formData[campo]} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input type="date" className="form-control" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Registrar</button>
              </form>
            </div>
          </div>
        </div>

        {/* Grilla (Columna Derecha) */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">Listado Actual</div>
            <div className="card-body p-0 table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th><th>Nombre</th><th>DNI</th><th>Email</th><th>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-3">No hay alumnos registrados</td></tr>
                  ) : (
                    alumnos.map((a) => (
                      <tr key={a.idPersona}>
                        <td>{a.idPersona}</td>
                        <td>{a.nombre} {a.apellido}</td>
                        <td>{a.dni}</td>
                        <td>{a.email}</td>
                        <td>{a.telefono}</td>
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