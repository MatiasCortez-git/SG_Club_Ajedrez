import { useState, useEffect } from 'react';

const VistaTalleres = () => {
  const [talleres, setTalleres] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  
  // Estado para las selecciones del formulario
  const [idTallerSeleccionado, setIdTallerSeleccionado] = useState('');
  const [idAlumnoSeleccionado, setIdAlumnoSeleccionado] = useState('');

  // Cargar datos iniciales
  const fetchData = async () => {
    try {
      const resTalleres = await fetch('http://localhost:8081/api/v1/talleres');
      if (resTalleres.ok) setTalleres(await resTalleres.json());

      const resAlumnos = await fetch('http://localhost:8081/api/v1/alumnos');
      if (resAlumnos.ok) setAlumnos(await resAlumnos.json());
    } catch (error) {
      console.error('Error de conexión con el backend:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función POST: Procesar Inscripción
  const handleInscripcion = async (e) => {
    e.preventDefault();
    if (!idTallerSeleccionado || !idAlumnoSeleccionado) {
      alert('Por favor seleccioná un alumno y un taller.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/v1/alumnos/${idAlumnoSeleccionado}/talleres/${idTallerSeleccionado}`, {
        method: 'POST'
      });

      if (response.status === 201) {
        alert('¡Inscripción realizada con código 201 Created!');
        setIdTallerSeleccionado('');
        setIdAlumnoSeleccionado('');
      } else {
        alert('Error al inscribir. Verificá si hay cupo o si ya está inscripto.');
      }
    } catch (error) {
      console.error('Error en la inscripción:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Catálogo de Talleres e Inscripción</h2>

      {/* SECCIÓN 1: Formulario de Inscripción */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Inscribir Alumno</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleInscripcion} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Seleccionar Alumno</label>
              <select className="form-select" value={idAlumnoSeleccionado} onChange={(e) => setIdAlumnoSeleccionado(e.target.value)} required>
                <option value="">-- Elegir Alumno --</option>
                {alumnos.map(a => (
                  <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label">Seleccionar Taller</label>
              <select className="form-select" value={idTallerSeleccionado} onChange={(e) => setIdTallerSeleccionado(e.target.value)} required>
                <option value="">-- Elegir Taller --</option>
                {talleres.map(t => (
                  <option key={t.idTaller} value={t.idTaller}>{t.nombre} - {t.tipoNivel}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">Inscribir</button>
            </div>
          </form>
        </div>
      </div>

      {/* SECCIÓN 2: Grilla de Catálogo */}
      <h4 className="mb-3">Talleres Disponibles</h4>
      <div className="row">
        {talleres.length === 0 ? (
          <div className="col-12"><p className="text-muted">No hay talleres disponibles.</p></div>
        ) : (
          talleres.map(taller => (
            <div className="col-md-4 mb-4" key={taller.idTaller}>
              <div className="card h-100 shadow-sm border-primary">
                <div className="card-body">
                  <h5 className="card-title text-primary">{taller.nombre}</h5>
                  <h6 className="card-subtitle mb-3 text-muted">Nivel: {taller.tipoNivel}</h6>
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item px-0"><strong>Cupo Máximo:</strong> {taller.cupoMaximo} alumnos</li>
                    <li className="list-group-item px-0"><strong>Costo:</strong> ${taller.costo}</li>
                    <li className="list-group-item px-0"><strong>Duración:</strong> {taller.duracion}</li>
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VistaTalleres;