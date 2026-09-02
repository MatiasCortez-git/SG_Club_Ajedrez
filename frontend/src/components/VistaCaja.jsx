import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ComprobantePago from './ComprobantePago';

const VistaCaja = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [idAlumno, setIdAlumno] = useState('');
  const [cuotas, setCuotas] = useState([]);
  
  const [periodo, setPeriodo] = useState('');
  const [medioPago, setMedioPago] = useState('Efectivo');
  
  const [tarifas, setTarifas] = useState({ cuotaSocio: '', adicionalFederado: '' });
  const [isTarifasOpen, setIsTarifasOpen] = useState(false);

  // Estados y Referencias para la Impresión del Recibo
  const [datosRecibo, setDatosRecibo] = useState(null);
  const componentePDFRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentePDFRef,
    documentTitle: 'Comprobante_Pago_Club_Ajedrez',
  });

  useEffect(() => {
    const fetchAlumnosYTarifas = async () => {
      try {
        const resAlumnos = await fetch('http://localhost:8081/api/v1/alumnos');
        if (resAlumnos.ok) setAlumnos(await resAlumnos.json());

        const resTarifas = await fetch('http://localhost:8081/api/v1/tarifas');
        if (resTarifas.ok) {
          const dataTarifas = await resTarifas.json();
          const cuotaSocio = dataTarifas.find(t => t.concepto === 'Cuota Socio')?.montoActual || '';
          const adicionalFederado = dataTarifas.find(t => t.concepto === 'Adicional Federado')?.montoActual || '';
          setTarifas({ cuotaSocio, adicionalFederado });
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
    };
    fetchAlumnosYTarifas();
  }, []);

  const fetchCuotas = async (id) => {
    if (!id) {
      setCuotas([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/api/v1/cuotas/alumno/${id}`);
      if (res.ok) setCuotas(await res.json());
    } catch (error) {
      console.error('Error al cargar cuotas:', error);
    }
  };

  useEffect(() => {
    fetchCuotas(idAlumno);
  }, [idAlumno]);

  const handleActualizarTarifas = async (e) => {
    e.preventDefault();
    try {
      const payload = [
        { concepto: 'Cuota Socio', montoActual: parseFloat(tarifas.cuotaSocio) },
        { concepto: 'Adicional Federado', montoActual: parseFloat(tarifas.adicionalFederado) }
      ];

      const res = await fetch('http://localhost:8081/api/v1/tarifas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('¡Tarifas actualizadas! Los próximos recibos se generarán con los nuevos montos.');
        setIsTarifasOpen(false);
      } else {
        alert('Error al actualizar las tarifas.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerarCuota = async (e) => {
    e.preventDefault();
    if (!idAlumno || !periodo) {
      alert('Seleccioná un alumno y escribí un periodo.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8081/api/v1/cuotas/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idAlumno: parseInt(idAlumno), periodo })
      });
      if (res.status === 201) {
        alert('¡Cuota generada con éxito!');
        setPeriodo('');
        fetchCuotas(idAlumno); 
      } else if (res.status === 409) {
        alert('La cuota para este periodo ya fue generada previamente.');
      } else {
        alert('Error al generar la cuota.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función para obtener el comprobante y disparar la impresión
  const handleImprimirRecibo = async (idPago) => {
    if (!idPago) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/pagos/${idPago}/comprobante`);
      if (res.ok) {
        const data = await res.json();
        setDatosRecibo(data);
        // Le damos 100ms a React para que re-renderice el componente oculto con los datos nuevos
        setTimeout(() => {
          handlePrint();
        }, 100);
      }
    } catch (error) {
      console.error('Error al cargar comprobante:', error);
    }
  };

  const handlePagar = async (idCuota) => {
    try {
      const payload = {
        idAlumno: parseInt(idAlumno),
        medioPago: medioPago,
        idsCuotasAPagar: [idCuota] 
      };
      const res = await fetch('http://localhost:8081/api/v1/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.status === 201 || res.ok) {
        const pagoData = await res.json();
        alert('¡Pago registrado correctamente!');
        fetchCuotas(idAlumno); 
        // Disparamos el ticket automáticamente tras pagar
        handleImprimirRecibo(pagoData.idPago);
      } else {
        alert('Error al registrar el pago (¿Quizás ya estaba pagada?).');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Caja: Gestión de Cuotas y Pagos</h2>

      {/* PANEL DE TARIFAS GLOBALES */}
      <div className="card shadow-sm mb-4 border-warning">
        <div 
          className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center" 
          onClick={() => setIsTarifasOpen(!isTarifasOpen)} 
          style={{ cursor: 'pointer' }}
        >
          <span>⚙️ Configuración de Valores Actuales</span>
          <small>{isTarifasOpen ? '(Ocultar)' : '(Desplegar)'}</small>
        </div>
        
        <div className={isTarifasOpen ? 'collapse show' : 'collapse'}>
          <div className="card-body bg-light">
            <form onSubmit={handleActualizarTarifas} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Socio Base ($)</label>
                <input 
                  type="number" 
                  className="form-control border-warning" 
                  value={tarifas.cuotaSocio} 
                  onChange={(e) => setTarifas({...tarifas, cuotaSocio: e.target.value})} 
                  required 
                />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Recargo Federado ($)</label>
                <input 
                  type="number" 
                  className="form-control border-warning" 
                  value={tarifas.adicionalFederado} 
                  onChange={(e) => setTarifas({...tarifas, adicionalFederado: e.target.value})} 
                  required 
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-warning w-100 fw-bold">Actualizar Tarifas</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* BUSCADOR PRINCIPAL */}
      <div className="card shadow-sm mb-4 border-info">
        <div className="card-body">
          <label className="form-label fw-bold">Seleccionar Alumno para Operar</label>
          <select className="form-select form-select-lg" value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)}>
            <option value="">-- Elegir Alumno --</option>
            {alumnos.map(a => (
              <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {/* PANEL IZQUIERDO: Generar Cuota */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-secondary">
            <div className="card-header bg-secondary text-white">Generar Nueva Cuota</div>
            <div className="card-body">
              <form onSubmit={handleGenerarCuota}>
                <div className="mb-3">
                  <label className="form-label">Periodo (Ej: 2026-09)</label>
                  <input type="text" className="form-control" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="AAAA-MM" required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={!idAlumno}>Generar Cuota</button>
              </form>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Tabla de Cuotas y Pagos */}
        <div className="col-md-8">
          <div className="card shadow-sm border-success">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <span>Estado de Cuenta del Alumno</span>
              <select className="form-select form-select-sm w-auto" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="MercadoPago">MercadoPago</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="card-body p-0 table-responsive">
              <table className="table table-striped table-hover mb-0 text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Periodo</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!idAlumno ? (
                    <tr><td colSpan="5" className="py-4 text-muted">Seleccioná un alumno arriba</td></tr>
                  ) : cuotas.length === 0 ? (
                    <tr><td colSpan="5" className="py-4 text-muted">El alumno no tiene cuotas generadas</td></tr>
                  ) : (
                    cuotas.map(c => (
                      <tr key={c.idCuota}>
                        <td className="fw-bold">{c.periodo}</td>
                        <td>{c.fechaVencimiento}</td>
                        <td>
                          <span className={`badge ${c.estado === 'Pagada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="fw-bold text-success">${c.montoTotal}</td>
                        <td>
                          {/* Lógica de botones restaurada: Imprimir si está saldada, Pagar si está pendiente */}
                          {c.estado === 'Pagada' ? (
                            <button 
                              className="btn btn-sm btn-info text-white fw-bold" 
                              onClick={() => handleImprimirRecibo(c.idPago)}
                            >
                              🖨️ Recibo
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => handlePagar(c.idCuota)}
                            >
                              Pagar
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
        </div>
      </div>

      {/* Componente de Impresión Oculto */}
      <div style={{ display: 'none' }}>
        {datosRecibo && <ComprobantePago ref={componentePDFRef} datos={datosRecibo} />}
      </div>
    </div>
  );
};

export default VistaCaja;