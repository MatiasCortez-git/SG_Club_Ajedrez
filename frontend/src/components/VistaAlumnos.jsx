import { useState, useEffect } from 'react';
import api from '../api'; // <-- interceptor
import Swal from 'sweetalert2'; // <-- importamos SweetAlert2

const VistaAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const rol = sessionStorage.getItem('rol');

  const estadoInicial = {
    nombre: '', apellido: '', dni: '', email: '', 
    telefono: '', fechaNacimiento: '', codFederacion: '', elo: ''
  };
  const [formData, setFormData] = useState(estadoInicial);

  // GET: Cargar alumnos
  const fetchAlumnos = async () => {
    try {
      const res = await api.get('/alumnos');
      setAlumnos(res.data);
    } catch (err) {
      Swal.fire('Error', 'Error al cargar alumnos', 'error');
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
        Swal.fire('Éxito', '¡Alumno actualizado!', 'success');
      } else {
        await api.post('/alumnos', formData);
        Swal.fire('Éxito', '¡Alumno registrado!', 'success');
      }
      
      setFormData(estadoInicial);
      setIsEditing(false);
      setCurrentId(null);
      fetchAlumnos();
    } catch (err) {
      Swal.fire('Error', 'Error al procesar la solicitud. Verificá los datos.', 'error');
    }
  };

  // Cargar datos en el formulario para editar
  const handleEdit = (alumno) => {
    setFormData({
      ...estadoInicial,
      ...alumno
    });
    setIsEditing(true);
    setCurrentId(alumno.idPersona);
  };

  // DELETE: Baja lógica
  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/alumnos/${id}`);
          Swal.fire('Éxito', 'Alumno dado de baja exitosamente.', 'success');
          fetchAlumnos();
        } catch (err) {
          Swal.fire('Error', 'Hubo un problema al eliminar el alumno.', 'error');
        }
      }
    });
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
          {/* Nombre */}
          <div className="col-6">
            <input
              type="text"
              className="form-control"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
                })
              }
              minLength={2}
              maxLength={50}
              required
            />
          </div>
          {/* Apellido */}
          <div className="col-6">
            <input
              type="text"
              className="form-control"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  apellido: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
                })
              }
              minLength={2}
              maxLength={50}
              required
            />
          </div>
        </div>

        {/* DNI */}
        <input
          type="text"
          className="form-control mb-2"
          name="dni"
          placeholder="DNI"
          value={formData.dni || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              dni: e.target.value.replace(/[^0-9]/g, "")
            })
          }
          minLength={8}
          maxLength={8}
          required
        />

        {/* Email */}
        <input
          type="email"
          className="form-control mb-2"
          name="email"
          placeholder="Email"
          value={formData.email || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value
            })
          }
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          required
        />

        {/* Teléfono */}
        <input
          type="text"
          className="form-control mb-2"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              telefono: e.target.value.replace(/[^0-9]/g, "")
            })
          }
          minLength={10}
          maxLength={15}
          required
        />

        {/* Fecha de nacimiento */}
        <input
          type="date"
          className="form-control mb-2"
          name="fechaNacimiento"
          value={formData.fechaNacimiento || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              fechaNacimiento: e.target.value
            })
          }
          max={new Date().toISOString().split("T")[0]}
          required
        />

        {/* Campos Opcionales de Federación */}
        <h6 className="mt-3 text-secondary">Datos Federativos (Opcional)</h6>
        <input
          type="text"
          className="form-control mb-2 border-info"
          name="codFederacion"
          placeholder="Cod. Federación"
          value={formData.codFederacion || ""}
          onChange={handleChange}
        />
        <input
          type="number"
          className="form-control mb-3 border-info"
          name="elo"
          placeholder="Puntaje ELO"
          value={formData.elo || ""}
          onChange={handleChange}
          min={0}
          max={2999}
        />

        <button
          type="submit"
          className={`btn w-100 ${isEditing ? 'btn-warning text-dark fw-bold' : 'btn-primary'}`}
        >
          {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
        </button>
        {isEditing && (
          <button
            type="button"
            className="btn btn-secondary w-100 mt-2"
            onClick={() => { setIsEditing(false); setFormData(estadoInicial); }}
          >
            Cancelar
          </button>
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
                          {rol === 'ROLE_ADMIN' && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.idPersona)}>Baja</button>
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

export default VistaAlumnos;
