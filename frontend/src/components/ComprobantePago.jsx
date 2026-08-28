import { forwardRef } from 'react';

const ComprobantePago = forwardRef(({ datos }, ref) => {
  if (!datos) return null;

  return (
    <div ref={ref} className="p-5 bg-white text-dark" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Cabecera Institucional */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 border-primary" style={{ borderBottomWidth: '3px !important' }}>
        <div className="d-flex align-items-center">
          <img src="/logo-alianza.png" alt="Logo Alianza Francesa" width="60" className="me-3" />
          <h2 className="text-primary fw-bold mb-0">Club de Ajedrez - Sede Paraná</h2>
        </div>
        <div className="text-end text-muted">
          <p className="mb-0">Recibo N°: <strong>{datos.idPago?.toString().padStart(6, '0')}</strong></p>
          <p className="mb-0">Fecha: {new Date(datos.fechaPago).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Datos del Alumno y Pago */}
      <div className="mb-4">
        <div className="row mb-2">
          <div className="col-4 text-muted">Alumno:</div>
          <div className="col-8 fw-bold">{datos.nombreAlumno}</div>
        </div>
        <div className="row mb-2">
          <div className="col-4 text-muted">Periodos Abonados:</div>
          <div className="col-8">{datos.periodosAbonados?.join(' | ')}</div>
        </div>
        <div className="row mb-2">
          <div className="col-4 text-muted">Medio de Pago:</div>
          <div className="col-8">{datos.medioPago}</div>
        </div>
      </div>

      {/* DESGLOSE FINANCIERO (Nuevo) */}
      <div className="mb-4">
        <h5 className="fw-semibold text-secondary border-bottom pb-2 mb-3">Conceptos Abonados</h5>
        
        {/* Cuota Socio */}
        <div className="d-flex justify-content-between mb-2">
          <span>Cuota Socio Base</span>
          <span>${datos.montoSocio}</span>
        </div>

        {/* Adicional Federado (Renderizado Condicional: Solo aparece si paga más de $0) */}
        {datos.montoFederado > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span>Adicional Federado (Canon)</span>
            <span>${datos.montoFederado}</span>
          </div>
        )}

        {/* Talleres */}
        {datos.talleres?.length > 0 && (
          <div className="mt-3">
            <span className="fw-bold d-block mb-1">Talleres Cursados:</span>
            <ul className="list-unstyled ps-3 mb-0 text-muted">
              {datos.talleres.map((taller, index) => (
                <li key={index} className="d-flex justify-content-between">
                  <span>- {taller.split(' ($')[0]}</span> {/* Nombre del taller */}
                  <span>${taller.split(' ($')[1].replace(')', '')}</span> {/* Precio extraído del string */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Total con acento rojo institucional */}
      <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center mb-5 border-start border-danger border-4 mt-4">
        <h5 className="mb-0 text-muted">Importe Total Recibido</h5>
        <h3 className="mb-0 text-primary fw-bold">${datos.montoTotal}</h3>
      </div>

      {/* Regla de Negocio Obligatoria */}
      <div className="mt-5 text-center pt-3 border-top text-muted" style={{ fontSize: '0.85rem' }}>
        <p className="fw-bold text-uppercase mb-0" style={{ color: 'var(--bs-danger)' }}>Documento no válido como factura</p>
        <p>Generado por el Sistema de Gestión del Club de Ajedrez</p>
      </div>
      
    </div>
  );
});

ComprobantePago.displayName = 'ComprobantePago';

export default ComprobantePago;