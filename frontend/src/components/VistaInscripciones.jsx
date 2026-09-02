import { useState, useEffect } from 'react';

const VistaInscripciones = () => {
  const [talleres, setTalleres] = useState([]);
  const [alumnos, setAlumnos] = useState([]); 
  const [inscriptos, setInscriptos] = useState([]);
  
  const [idTallerSeleccionado, setIdTallerSeleccionado] = useState('');
  
  // Estado del Modal
  const [showModal, setShowModal] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');

  // 1. Cargar catálogo de talleres y padrón general de alumnos al iniciar
  useEffect(() => {
    const fetchInicial = async () => {
      try {
        const resTalleres = await fetch('http://localhost:8081/api/v1/talleres');
        if (resTalleres.ok) setTalleres(await resTalleres.json());

        const resAlumnos = await fetch('http://localhost:8081/api/v1/alumnos');
        if (resAlumnos.ok) setAlumnos(await resAlumnos.json());
      } catch (error) {
        console.error('Error al cargar datos base:', error);
      }
    };
    fetchInicial();
  }, []);

  // 2. Cargar inscriptos CADA VEZ que se selecciona un taller
  const fetchInscriptos = async (idTaller) => {
    if (!idTaller) {
      setInscriptos([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/api/v1/talleres/${idTaller}/alumnos`);
      if (res.ok) setInscriptos(await res.json());
    } catch (error) {
      console.error('Error al cargar inscriptos:', error);
    }
  };

  useEffect(() => {
    fetchInscriptos(idTallerSeleccionado);
  }, [idTallerSeleccionado]);

  // 3. Acción: Desinscripción Individual
  const handleBaja = async (idAlumno) => {
    if (!window.confirm('¿Seguro que deseas remover a este alumno del taller?')) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/alumnos/${idAlumno}/talleres/${idTallerSeleccionado}`, {
        method: 'DELETE'
      });
      if (res.status === 204 || res.ok) {
        fetchInscriptos(idTallerSeleccionado);
      }
    } catch (error) {
      console.error('Error al dar de baja:', error);
    }
  };

  // 4. Acción: Reset Masivo del Taller (Doble Confirmación)
  const handleResetCiclo = async () => {
    if (!idTallerSeleccionado) return;
    
    const primeraConfirmacion = window.confirm('⚠️ ATENCIÓN: Estás a punto de vaciar este taller por completo. ¿Deseas continuar?');
    if (!primeraConfirmacion) return;

    const segundaConfirmacion = window.confirm('🛑 ÚLTIMO AVISO: Esta acción es irreversible. ¿Confirmás el vaciado del aula?');
    if (!segundaConfirmacion) return;

    try {
      const res = await fetch(`http://localhost:8081/api/v1/talleres/${idTallerSeleccionado}/reset-ciclo`, {
        method: 'DELETE'
      });
      if (res.status === 204 || res.ok) {
        alert('El ciclo lectivo de este taller ha sido reseteado exitosamente.');
        fetchInscriptos(idTallerSeleccionado);
      }
    } catch (error) {
      console.error('Error en el reset:', error);
    }
  };

  // 5. Acción: Inscribir Nuevo Alumno
  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;

    try {
      const res = await fetch(`http://localhost:8081/api/v1/alumnos/${alumnoSeleccionado}/talleres/${idTallerSeleccionado}`, {
        method: 'POST'
      }); 
      if (res.status === 201 || res.ok) {
        setShowModal(false);
        setAlumnoSeleccionado('');
        fetchInscriptos(idTallerSeleccionado);
      } else {
        alert('Error al inscribir (Verificá si el alumno ya está inscripto).');
      }
    } catch (error) {
      console.error('Error en inscripción:', error);
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <h2 className="mb-4 text-center text-primary">Gestión de Inscripciones y Aulas</h2>

      {/* Controles Superiores */}
      <div className="card shadow-sm mb-4 border-primary">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
            <label className="form-label fw-bold">Seleccionar Taller</label>
            <select 
              className="form-select form-select-lg border-primary" 
              value={idTallerSeleccionado} 
              onChange={(e) => setIdTallerSeleccionado(e.target.value)}
            >
              <option value="">-- Elegir Taller --</option>
              {talleres.map(t => (
                <option key={t.idTaller} value={t.idTaller}>{t.nombre} - {t.tipoNivel}</option>
              ))}
            </select>
          </div>
          
          <div>
            <button 
              className="btn btn-danger fw-bold shadow-sm" 
              onClick={handleResetCiclo}
              disabled={!idTallerSeleccionado}
            >
              ⚠️ Resetear Ciclo Lectivo
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Central */}
      <div className="card shadow-sm border-info">
        <div className="card-header bg-info text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Alumnos Inscriptos</h5>
          <button 
            className="btn btn-sm btn-success fw-bold shadow-sm"
            onClick={() => setShowModal(true)}
            disabled={!idTallerSeleccionado}
          >
            ➕ Inscribir Nuevo Alumno
          </button>
        </div>
        <div className="card-body p-0 table-responsive">
          <table className="table table-striped table-hover mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre y Apellido</th>
                <th>DNI</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {!idTallerSeleccionado ? (
                <tr><td colSpan="3" className="py-4 text-muted">Seleccioná un taller para ver su aula.</td></tr>
              ) : inscriptos.length === 0 ? (
                <tr><td colSpan="3" className="py-4 text-muted">El aula está vacía.</td></tr>
              ) : (
                inscriptos.map(a => (
                  <tr key={a.idPersona}>
                    <td className="fw-semibold text-start ps-4">{a.nombre} {a.apellido}</td>
                    <td>{a.dni}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleBaja(a.idPersona)}
                        title="Desinscribir del Taller"
                      >
                        🗑️ Dar de Baja
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Inscripción */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-success">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Inscribir al Taller</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleInscribir}>
                <div className="modal-body">
                  <label className="form-label fw-bold">Buscar Alumno en el Padrón</label>
                  <select 
                    className="form-select" 
                    value={alumnoSeleccionado} 
                    onChange={(e) => setAlumnoSeleccionado(e.target.value)} 
                    required
                  >
                    <option value="">-- Seleccionar Alumno --</option>
                    {alumnos.map(a => (
                      <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success fw-bold">Inscribir</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaInscripciones;