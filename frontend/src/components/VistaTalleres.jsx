import { useState, useEffect } from 'react';

const VistaTalleres = () => {
  const [talleres, setTalleres] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [alumnos, setAlumnos] = useState([]); // Nuevo estado para alumnos
  const [error, setError] = useState('');
  
  // Estados para Edición
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Estados para el Modal de Inscripción
  const [showModal, setShowModal] = useState(false);
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');

  const estadoInicial = {
    nombre: '', cupoMaximo: '', duracion: '', costo: '', tipoNivel: 'Recreativo', idProfesor: ''
  };
  const [formData, setFormData] = useState(estadoInicial);

  // GET: Cargar Talleres, Profesores y Alumnos
  const fetchData = async () => {
    try {
      const [resTalleres, resProfesores, resAlumnos] = await Promise.all([
        fetch('http://localhost:8081/api/v1/talleres'),
        fetch('http://localhost:8081/api/v1/profesores'),
        fetch('http://localhost:8081/api/v1/alumnos')
      ]);
      if (resTalleres.ok) setTalleres(await resTalleres.json());
      if (resProfesores.ok) setProfesores(await resProfesores.json());
      if (resAlumnos.ok) setAlumnos(await resAlumnos.json());
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // POST o PUT: Guardar o Editar Taller
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = isEditing 
      ? `http://localhost:8081/api/v1/talleres/${currentId}` 
      : 'http://localhost:8081/api/v1/talleres';
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cupoMaximo: parseInt(formData.cupoMaximo),
          costo: parseFloat(formData.costo),
          idProfesor: parseInt(formData.idProfesor)
        })
      });

      if (res.ok || res.status === 201) {
        alert(isEditing ? '¡Taller actualizado!' : '¡Taller registrado!');
        setFormData(estadoInicial);
        setIsEditing(false);
        setCurrentId(null);
        fetchData();
      } else {
        setError('Error al procesar la solicitud.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleEdit = (taller) => {
    setFormData({
      nombre: taller.nombre,
      cupoMaximo: taller.cupoMaximo,
      duracion: taller.duracion || '',
      costo: taller.costo,
      tipoNivel: taller.tipoNivel || taller.nivel,
      idProfesor: taller.idProfesor || ''
    });
    setIsEditing(true);
    setCurrentId(taller.idTaller);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de dar de baja este taller?')) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/talleres/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        alert('Taller eliminado exitosamente.');
        fetchData();
      }
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  // POST: Procesar la Inscripción
  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;

    try {
      const res = await fetch(`http://localhost:8081/api/v1/alumnos/${alumnoSeleccionado}/talleres/${tallerSeleccionado.idTaller}`, {
        method: 'POST'
      }); // No enviamos body porque los IDs ya viajan en la URL[cite: 1]

      if (res.status === 201) {
        alert('¡Alumno inscripto con éxito!');
        setShowModal(false);
        setAlumnoSeleccionado('');
        fetchData(); // Refresca para actualizar la barra de cupos
      } else {
        alert('Error al inscribir (Verificá si el taller ya está lleno o si el alumno ya está inscripto).');
      }
    } catch (err) {
      console.error('Error en la inscripción:', err);
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <h2 className="mb-4 text-center text-primary">Catálogo y Gestión de Talleres</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Formulario (Izquierda) */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{isEditing ? 'Editar Taller' : 'Nuevo Taller'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <input type="text" className="form-control mb-2" name="nombre" placeholder="Nombre del Taller" value={formData.nombre} onChange={handleChange} required />
                <div className="row g-2 mb-2">
                  <div className="col-6"><input type="number" className="form-control" name="cupoMaximo" placeholder="Cupo Máx" value={formData.cupoMaximo} onChange={handleChange} required /></div>
                  <div className="col-6"><input type="number" className="form-control" name="costo" placeholder="Costo Mensual ($)" value={formData.costo} onChange={handleChange} required /></div>
                </div>
                <input type="text" className="form-control mb-2" name="duracion" placeholder="Duración (Ej: 4 meses)" value={formData.duracion} onChange={handleChange} required />
                
                <select className="form-select mb-2" name="tipoNivel" value={formData.tipoNivel} onChange={handleChange} required>
                  <option value="Principiante">Principiante</option>
                  <option value="Recreativo">Recreativo</option>
                  <option value="Federado">Federado</option>
                </select>

                <select className="form-select mb-3" name="idProfesor" value={formData.idProfesor} onChange={handleChange} required>
                  <option value="">-- Asignar Profesor --</option>
                  {profesores.map(p => (
                    <option key={p.idPersona} value={p.idPersona}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
                
                <button type="submit" className={`btn w-100 ${isEditing ? 'btn-warning text-dark fw-bold' : 'btn-primary'}`}>
                  {isEditing ? 'Guardar Cambios' : 'Registrar Taller'}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => { setIsEditing(false); setFormData(estadoInicial); }}>Cancelar</button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Grilla de Cards (Derecha) */}
        <div className="col-md-8">
          <div className="row">
            {talleres.length === 0 ? (
              <div className="col-12 text-center py-4 text-muted">No hay talleres disponibles en el catálogo.</div>
            ) : (
              talleres.map(t => {
                const inscriptos = t.inscriptos || 0;
                const porcentajeCupo = Math.round((inscriptos / t.cupoMaximo) * 100);
                const colorBarra = porcentajeCupo >= 90 ? 'bg-danger' : porcentajeCupo >= 60 ? 'bg-warning' : 'bg-success';
                const sinCupo = inscriptos >= t.cupoMaximo;

                return (
                  <div className="col-md-6 mb-3" key={t.idTaller}>
                    <div className="card shadow-sm h-100 border-0 border-start border-4 border-primary">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title text-primary fw-bold mb-0">{t.nombre}</h5>
                          <span className={`badge ${t.tipoNivel === 'Federado' ? 'bg-danger' : 'bg-info text-dark'}`}>
                            {t.tipoNivel || t.nivel}
                          </span>
                        </div>
                        <p className="card-text text-muted small mb-2">Duración: {t.duracion}</p>
                        <h6 className="fw-bold text-success mb-3">${t.costo} / mes</h6>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Ocupación: {inscriptos} / {t.cupoMaximo}</span>
                            <span className="fw-bold">{porcentajeCupo}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className={`progress-bar ${colorBarra}`} role="progressbar" style={{ width: `${porcentajeCupo}%` }}></div>
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="mt-auto d-flex flex-column gap-2">
                          <button 
                            className="btn btn-sm btn-primary fw-bold" 
                            disabled={sinCupo}
                            onClick={() => { setTallerSeleccionado(t); setShowModal(true); }}>
                            {sinCupo ? 'Cupo Lleno' : 'Inscribir Alumno'}
                          </button>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary w-50" onClick={() => handleEdit(t)}>Editar</button>
                            <button className="btn btn-sm btn-outline-danger w-50" onClick={() => handleDelete(t.idTaller)}>Baja</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Inscripción (Superpuesto vía condicional React) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Inscripción: {tallerSeleccionado?.nombre}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleInscribir}>
                <div className="modal-body">
                  <label className="form-label fw-bold">Seleccionar Alumno</label>
                  <select className="form-select" value={alumnoSeleccionado} onChange={(e) => setAlumnoSeleccionado(e.target.value)} required>
                    <option value="">-- Buscar Alumno --</option>
                    {alumnos.map(a => (
                      <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <span className="text-muted small">Costo mensual a liquidar: ${tallerSeleccionado?.costo}</span>
                  <div>
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-success fw-bold">Confirmar Inscripción</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaTalleres;