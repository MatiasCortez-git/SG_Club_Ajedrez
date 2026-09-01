import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReporteRanking from './ReporteRanking';

const VistaReportes = () => {
  const [ranking, setRanking] = useState([]);
  const componentePDFRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentePDFRef,
    documentTitle: 'Ranking_ELO_Club_Ajedrez',
  });

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/v1/reportes/ranking');
        if (res.ok) {
          const data = await res.json();
          setRanking(data);
        }
      } catch (error) {
        console.error('Error al cargar el ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="container mt-4">
      {/* Cabecera y Botón Disparador */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Módulo de Reportes</h2>
        <button className="btn btn-primary shadow-sm fw-bold" onClick={handlePrint}>
          🖨️ Imprimir Ranking ELO
        </button>
      </div>

      {/* Grilla Responsiva para la Pantalla (Vista de Usuario) */}
      <div className="card shadow-sm border-primary">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Ranking ELO - Jugadores Federados</h5>
        </div>
        
        {/* El div con table-responsive asegura que no se rompa en celulares */}
        <div className="card-body p-0 table-responsive">
          <table className="table table-striped table-hover mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Posición</th>
                <th>Nombre Completo</th>
                <th>DNI</th>
                <th>Cód. Federación</th>
                <th>Puntaje ELO</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-muted">No hay jugadores federados registrados en el club.</td>
                </tr>
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

      {/* Plantilla Oculta para el PDF (Solo la usa react-to-print) */}
      <div style={{ display: 'none' }}>
        <ReporteRanking ref={componentePDFRef} ranking={ranking} />
      </div>
    </div>
  );
};

export default VistaReportes;