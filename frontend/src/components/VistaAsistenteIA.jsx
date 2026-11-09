import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import VisorResultadosIA from './VisorResultadosIA';

const VistaAsistenteIA = () => {
  // 1. Capturamos el rol
  const rol = sessionStorage.getItem('rol');

  // 2. Expulsión inmediata si es Staff
  if (rol === 'ROLE_STAFF') {
    return <Navigate to="/dashboard" replace />;
  }
  const [tabActiva, setTabActiva] = useState('ANALISIS');
  const [alumnos, setAlumnos] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Cerrojo de interfaz

  const [pgnFile, setPgnFile] = useState(null);
  const [idAlumno, setIdAlumno] = useState('');
  const [tema, setTema] = useState('');
  const [cantidad, setCantidad] = useState(3);

  useEffect(() => {
    api.get('/alumnos')
      .then(res => setAlumnos(res.data))
      .catch(() => {}); 
  }, []);

  const lanzarAlertaCarga = (tipo) => {
    const mensajes = tipo === 'ANALISIS'
      ? ["Validando archivo PGN...", "Stockfish está buscando los peores errores...", "Llama 3.2 redactando informe pedagógico...", "Ajustando formato..."]
      : ["Consultando base de datos táctica...", "Filtrando por temática...", "Llama 3.2 diseñando la estructura de la clase...", "Generando PGN..."];
    
    let i = 0;

    Swal.fire({
      title: 'Procesando con Inteligencia Artificial',
      html: `<div class="mt-3"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span><b id="swal-texto-dinamico" class="text-primary">${mensajes[0]}</b></div><p class="text-muted small mt-3">Esta operación requiere alto poder de cómputo y puede tardar entre 2 y 5 minutos. Por favor, no cierres ni recargues esta pestaña.</p>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        window.loadingInterval = setInterval(() => {
          i = (i + 1) % mensajes.length;
          const label = document.getElementById('swal-texto-dinamico');
          if (label) label.textContent = mensajes[i];
        }, 15000); 
      },
      willClose: () => {
        clearInterval(window.loadingInterval);
      }
    });
  };

const handleAnalizarPgn = async (e) => {
    e.preventDefault();
    if (!pgnFile || !idAlumno) return;

    setIsSubmitting(true);
    lanzarAlertaCarga('ANALISIS');
    
    const formData = new FormData();
    formData.append('file', pgnFile);
    formData.append('idAlumno', idAlumno);

    try {
      const res = await api.post('/ia/analizar-pgn', formData, {
        timeout: 360000 
      });
      setAiResponse(res.data); 
      Swal.close(); // Solo cerramos si hubo éxito
    } catch (err) {
      // Amortiguador silencioso: api.js muestra el error y NO lo cerramos.
    } finally {
      setIsSubmitting(false); // Liberamos el cerrojo siempre
    }
  };

  const handlePlanificarClase = async (e) => {
    e.preventDefault();
    if (!tema || !cantidad) return;

    setIsSubmitting(true);
    lanzarAlertaCarga('PLANIFICADOR');

    try {
      const res = await api.post('/ia/planificador', { tema, cantidad }, {
        timeout: 360000 
      });
      setAiResponse(res.data);
      Swal.close(); // Solo cerramos si hubo éxito
    } catch (err) {
      // Amortiguador silencioso
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleVolver = () => {
    setAiResponse(null);
    setPgnFile(null);
    setIdAlumno('');
    setTema('');
    setCantidad(3);
  };

return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 text-center text-primary fw-bold">Asistente IA para Profesores</h2>

      {/* ADVERTENCIA GLOBAL ARRIBA PARA MEJOR VISIBILIDAD */}
      <div className="alert alert-warning py-2 shadow-sm border-0 text-center mb-4">
        <small><b> Importante:</b> Tenés un límite de <b>5 consultas en total</b> para utilizar cualquiera de las herramientas de IA.</small>
      </div>

      {aiResponse ? (
        <VisorResultadosIA aiResponse={aiResponse} onVolver={handleVolver} />
      ) : (
        <div className="card shadow-sm border-primary">
          <div className="card-header bg-primary text-white p-0">
            <ul className="nav nav-tabs card-header-tabs m-0 border-bottom-0">
              <li className="nav-item">
                <button 
                  className={`nav-link fw-bold border-0 ${tabActiva === 'ANALISIS' ? 'bg-white text-primary' : 'bg-transparent text-white'}`}
                  onClick={() => !isSubmitting && setTabActiva('ANALISIS')}
                  style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
                >
                  Analizar Partidas (PGN)
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-bold border-0 ${tabActiva === 'PLANIFICADOR' ? 'bg-white text-primary' : 'bg-transparent text-white'}`}
                  onClick={() => !isSubmitting && setTabActiva('PLANIFICADOR')}
                  style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
                >
                  Asistente de Clase
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            
            {/* FORMULARIO 1: ANÁLISIS */}
            {tabActiva === 'ANALISIS' && (
            <form onSubmit={handleAnalizarPgn}>                
                <p className="text-muted mb-4">Subí el archivo .pgn de tu alumno. La IA identificará los peores errores y generará un informe pedagógico.</p>
                
                <div className="mb-3">
                <label className="form-label fw-bold">Seleccionar Alumno Evaluado</label>
                <select className="form-select" value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)} required disabled={isSubmitting}>
                    <option value="">-- Buscar Alumno --</option>
                    {alumnos.map(a => (
                    <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
                    ))}
                </select>
                </div>
                
                <div className="mb-4">
                <label className="form-label fw-bold">Archivo PGN</label>
                <input type="file" className="form-control" accept=".pgn" onChange={(e) => setPgnFile(e.target.files[0])} required disabled={isSubmitting} />
                </div>

                <div className="alert alert-info py-2 shadow-sm border-0">
                <small><b> Importante:</b> El archivo PGN debe contener <b>hasta 3 partidas como máximo</b>.</small>
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
                {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                    </svg>
                )}
                {isSubmitting ? 'Procesando...' : 'Iniciar Análisis de Partidas'}
                </button>
            </form>
            )}

            {/* FORMULARIO 2: PLANIFICADOR */}
            {tabActiva === 'PLANIFICADOR' && (
            <form onSubmit={handlePlanificarClase}>
                <p className="text-muted mb-4">Describí el tema que querés enseñar y las características de tu grupo. La IA generará ejercicios temáticos y te brindará algunos consejos prácticos para dar tu clase.</p>
                
                <div className="mb-3">
                <label className="form-label fw-bold">Descripción de la Clase y del Grupo</label>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej: Clase para adultos principiantes para que mejoren en el final de las partidas." 
                    value={tema} 
                    onChange={(e) => setTema(e.target.value)} 
                    required 
                    disabled={isSubmitting} 
                />
                </div>
                
                <div className="mb-4">
                <label className="form-label fw-bold">Cantidad de Ejercicios PGN</label>
                <input type="number" className="form-control" min="1" max="10" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required disabled={isSubmitting} />
                <small className="text-muted">La IA puede armar hasta 10 ejercicios temáticos.</small>
                </div>
                
                <button type="submit" className="btn btn-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
                {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z"/>
                    </svg>
                )}
                {isSubmitting ? 'Generando...' : 'Generar Clase Temática'}
                </button>
            </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default VistaAsistenteIA;