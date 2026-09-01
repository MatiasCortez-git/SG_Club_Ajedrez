import { forwardRef } from 'react';

const ReporteMorosos = forwardRef(({ morosos }, ref) => {
  return (
    <div ref={ref} className="p-5 bg-white text-dark" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Cabecera Institucional */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 border-danger" style={{ borderBottomWidth: '3px !important' }}>
        <div className="d-flex align-items-center">
          <img src="/logo-alianza.png" alt="Logo Alianza Francesa" width="60" className="me-3" />
          <h2 className="text-danger fw-bold mb-0">Club de Ajedrez - Sede Paraná</h2>
        </div>
        <div className="text-end text-muted">
          <p className="mb-0 text-uppercase fw-bold">Reporte Contable</p>
          <p className="mb-0">Estado de Morosidad</p>
        </div>
      </div>

      <h4 className="fw-semibold text-secondary mb-4 text-center">Listado de Alumnos con Deuda Pendiente</h4>

      {/* Tabla del Reporte PDF */}
      <table className="table table-bordered table-striped text-center align-middle">
        <thead className="table-danger">
          <tr>
            <th style={{ width: '45%' }}>Nombre Completo</th>
            <th style={{ width: '25%' }}>DNI</th>
            <th style={{ width: '30%' }}>Total Adeudado</th>
          </tr>
        </thead>
        <tbody>
          {morosos?.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 text-muted">No se registran alumnos con deudas pendientes. ¡Finanzas al día!</td>
            </tr>
          ) : (
            morosos?.map((alumno) => (
              <tr key={alumno.dni}>
                <td className="text-start ps-3 fw-semibold">{alumno.nombreCompleto}</td>
                <td>{alumno.dni}</td>
                <td className="fw-bold text-danger fs-5">${alumno.montoAdeudado}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div className="mt-5 text-center pt-3 border-top text-muted" style={{ fontSize: '0.85rem' }}>
        <p>Documento confidencial generado por el Sistema de Gestión del Club de Ajedrez</p>
      </div>
    </div>
  );
});

ReporteMorosos.displayName = 'ReporteMorosos';

export default ReporteMorosos;