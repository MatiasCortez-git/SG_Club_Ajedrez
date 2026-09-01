import { forwardRef } from 'react';

const ReporteRanking = forwardRef(({ ranking }, ref) => {
  return (
    <div ref={ref} className="p-5 bg-white text-dark" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Cabecera Institucional */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 border-primary" style={{ borderBottomWidth: '3px !important' }}>
        <div className="d-flex align-items-center">
          <img src="/logo-alianza.png" alt="Logo Alianza Francesa" width="60" className="me-3" />
          <h2 className="text-primary fw-bold mb-0">Club de Ajedrez - Sede Paraná</h2>
        </div>
        <div className="text-end text-muted">
          <p className="mb-0 text-uppercase fw-bold">Reporte Gerencial</p>
          <p className="mb-0">Ranking ELO</p>
        </div>
      </div>

      <h4 className="fw-semibold text-secondary mb-4 text-center">Clasificación de Jugadores Federados</h4>

      {/* Tabla del Ranking */}
      <table className="table table-bordered table-striped text-center align-middle">
        <thead className="table-primary">
          <tr>
            <th style={{ width: '10%' }}>Posición</th>
            <th style={{ width: '40%' }}>Nombre Completo</th>
            <th style={{ width: '20%' }}>DNI</th>
            <th style={{ width: '15%' }}>Cód. Federación</th>
            <th style={{ width: '15%' }}>Puntaje ELO</th>
          </tr>
        </thead>
        <tbody>
          {ranking?.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-muted">No hay jugadores federados registrados en el club.</td>
            </tr>
          ) : (
            ranking?.map((jugador, index) => (
              <tr key={jugador.dni}>
                <td className="fw-bold fs-5">{index + 1}</td>
                <td className="text-start ps-3 fw-semibold">{jugador.nombreCompleto}</td>
                <td>{jugador.dni}</td>
                <td>{jugador.codFederacion}</td>
                <td className="fw-bold" style={{ color: 'var(--bs-danger)', fontSize: '1.1rem' }}>
                  {jugador.elo}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div className="mt-5 text-center pt-3 border-top text-muted" style={{ fontSize: '0.85rem' }}>
        <p>Documento generado por el Sistema de Gestión del Club de Ajedrez</p>
      </div>
    </div>
  );
});

ReporteRanking.displayName = 'ReporteRanking';

export default ReporteRanking;