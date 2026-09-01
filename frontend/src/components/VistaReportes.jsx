import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReporteRanking from './ReporteRanking';
import ReporteMorosos from './ReporteMorosos';

const VistaReportes = () => {
  // Estado para controlar la pestaña activa
  const [tabActiva, setTabActiva] = useState('ELO');
  
  // Estados para los datos
  const [ranking, setRanking] = useState([]);
  const [morosos, setMorosos] = useState([]);

  // Referencias y Hooks de impresión desacoplados
  const eloRef = useRef();
  const morososRef = useRef();

  const handlePrintElo = useReactToPrint({
    contentRef: eloRef,
    documentTitle: 'Ranking_ELO_Club_Ajedrez',
  });

  const handlePrintMorosos = useReactToPrint({
    contentRef: morososRef,
    documentTitle: 'Alumnos_Morosos_Club_Ajedrez',
  });

  // Lazy Fetching: Solo busca los datos cuando se activa la pestaña y si aún no se cargaron
  useEffect(() => {
    if (tabActiva === 'ELO' && ranking.length === 0) {
      fetch('http://localhost:8081/api/v1/reportes/ranking')
        .then(res => res.ok ? res.json() : [])
        .then(data => setRanking(data))
        .catch(err => console.error(err));
    }
    
    if (tabActiva === 'MOROSOS' && morosos.length === 0) {
      fetch('http://localhost:8081/api/v1/reportes/morosos')
        .then(res => res.ok ? res.json() : [])
        .then(data => setMorosos(data))
        .catch(err => console.error(err));
    }
  }, [tabActiva]); 

  return (
    <div className="container mt-4">
      
      {/* Cabecera y Botones Dinámicos */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Módulo de Reportes</h2>
        
        {/* El botón cambia inteligentemente según la pestaña */}
        {tabActiva === 'ELO' ? (
          <button className="btn btn-primary shadow-sm fw-bold" onClick={handlePrintElo}>
            🖨️ Imprimir Ranking ELO
          </button>
        ) : (
          <button className="btn btn-danger shadow-sm fw-bold" onClick={handlePrintMorosos}>
            🖨️ Imprimir Reporte de Morosos
          </button>
        )}
      </div>

      {/* Menú de Pestañas (Tabs de Bootstrap) */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link text-uppercase fw-bold ${tabActiva === 'ELO' ? 'active text-primary' : 'text-secondary'}`} 
            onClick={() => setTabActiva('ELO')}
          >
            Ranking ELO
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link text-uppercase fw-bold ${tabActiva === 'MOROSOS' ? 'active text-danger' : 'text-secondary'}`} 
            onClick={() => setTabActiva('MOROSOS')}
          >
            Alumnos Morosos
          </button>
        </li>
      </ul>

      {/* Contenido Condicional */}
      {tabActiva === 'ELO' && (
        <div className="card shadow-sm border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Ranking ELO - Jugadores Federados</h5>
          </div>
          <div className="card-body p-0 table-responsive">
            <table className="table table-striped table-hover mb-0 text-center align-middle">
              <thead className="table-light">
                <tr><th>Posición</th><th>Nombre Completo</th><th>DNI</th><th>Cód. Federación</th><th>Puntaje ELO</th></tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr><td colSpan="5" className="py-4 text-muted">Cargando datos o sin registros...</td></tr>
                ) : (
                  ranking.map((jugador, index) => (
                    <tr key={jugador.dni}>
                      <td className="fw-bold">{index + 1}</td>
                      <td className="text-start ps-3 fw-semibold">{jugador.nombreCompleto}</td>
                      <td>{jugador.dni}</td>
                      <td><span className="badge bg-info text-dark">{jugador.codFederacion}</span></td>
                      <td className="fw-bold text-danger">{jugador.elo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tabActiva === 'MOROSOS' && (
        <div className="card shadow-sm border-danger">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">Estado de Morosidad Actual</h5>
          </div>
          <div className="card-body p-0 table-responsive">
            <table className="table table-striped table-hover mb-0 text-center align-middle">
              <thead className="table-light">
                <tr><th>Nombre Completo</th><th>DNI</th><th>Total Adeudado</th></tr>
              </thead>
              <tbody>
                {morosos.length === 0 ? (
                  <tr><td colSpan="3" className="py-4 text-muted">No se registran alumnos con deudas.</td></tr>
                ) : (
                  morosos.map((alumno) => (
                    <tr key={alumno.dni}>
                      <td className="text-start ps-3 fw-semibold">{alumno.nombreCompleto}</td>
                      <td>{alumno.dni}</td>
                      <td className="fw-bold text-danger fs-5">${alumno.montoAdeudado}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plantillas Ocultas para PDFs */}
      <div style={{ display: 'none' }}>
        <ReporteRanking ref={eloRef} ranking={ranking} />
        <ReporteMorosos ref={morososRef} morosos={morosos} />
      </div>

    </div>
  );
};

export default VistaReportes;