import { useState, useEffect } from 'react';
import api from '../api'; 
import Swal from 'sweetalert2'; 

const VistaInscripciones = () => {
  const [talleres, setTalleres] = useState([]);
  const [alumnos, setAlumnos] = useState([]); 
  const [inscriptos, setInscriptos] = useState([]);
  
  const [idTallerSeleccionado, setIdTallerSeleccionado] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const rol = sessionStorage.getItem('rol');

  useEffect(() => {
    const fetchInicial = async () => {
      try {
        const [resTalleres, resAlumnos] = await Promise.all([
          api.get('/talleres'),
          api.get('/alumnos')
        ]);
        setTalleres(resTalleres.data);
        setAlumnos(resAlumnos.data);
      } catch (error) {
        // Amortiguador silencioso: api.js mostrará error de conexión si falla
      }
    };
    fetchInicial();
  }, []);

  const fetchInscriptos = async (idTaller) => {
    if (!idTaller) {
      setInscriptos([]);
      return;
    }
    try {
      const res = await api.get(`/talleres/${idTaller}/alumnos`);
      setInscriptos(res.data);
    } catch (error) {
      // Amortiguador silencioso
    }
  };

  useEffect(() => {
    fetchInscriptos(idTallerSeleccionado);
  }, [idTallerSeleccionado]);

  const handleBaja = async (idAlumno) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción removerá al alumno del taller.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, remover',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/alumnos/${idAlumno}/talleres/${idTallerSeleccionado}`);
          Swal.fire('Operación completada', 'Alumno removido exitosamente.', 'success');
          fetchInscriptos(idTallerSeleccionado);
        } catch (error) {
          // Amortiguador silencioso
        }
      }
    });
  };

  const handleResetCiclo = async () => {
    if (!idTallerSeleccionado) return;
    
    Swal.fire({
      title: '⚠️ ATENCIÓN: Vaciado de Aula',
      text: "Estás a punto de vaciar este taller por completo. Esta acción es irreversible. ¿Confirmás el reseteo del ciclo lectivo?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, vaciar aula',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/talleres/${idTallerSeleccionado}/reset-ciclo`);
          Swal.fire('Operación completada', 'El ciclo lectivo ha sido reseteado exitosamente.', 'success');
          fetchInscriptos(idTallerSeleccionado);
        } catch (error) {
          // Amortiguador silencioso
        }
      }
    });
  };

  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;

    try {
      await api.post(`/alumnos/${alumnoSeleccionado}/talleres/${idTallerSeleccionado}`);
      Swal.fire('Operación completada', 'Alumno inscripto correctamente.', 'success');
      setShowModal(false);
      setAlumnoSeleccionado('');
      fetchInscriptos(idTallerSeleccionado);
    } catch (error) {
      // Amortiguador: api.js atrapa automáticamente si el taller está lleno (400) o si el alumno ya está inscripto (409)
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
            {/* Solo renderiza este botón si el rol es ROLE_ADMIN */}
            {rol === 'ROLE_ADMIN' && (
              <button 
                className="btn btn-danger fw-bold shadow-sm" 
                onClick={handleResetCiclo}
                disabled={!idTallerSeleccionado}
              >
                ⚠️ Resetear Ciclo Lectivo
              </button>
            )}
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
            + Inscribir Nuevo Alumno
          </button>
        </div>
        <div className="card-body p-0 table-responsive">
          <table className="table table-striped table-hover mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre y Apellido</th>
                <th>DNI</th>
                {/* Solo renderiza este columna si el rol es ROLE_ADMIN */}
                {rol === 'ROLE_ADMIN' && (<th>Acción</th>)}
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
                      {/* Solo renderiza este botón si el rol es ROLE_ADMIN */}
                      {rol === 'ROLE_ADMIN' && (
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleBaja(a.idPersona)}
                          title="Desinscribir del Taller"
                        >
                          Dar de Baja
                        </button>
                      )}
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