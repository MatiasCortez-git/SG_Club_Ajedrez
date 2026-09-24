import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ComprobantePago from './ComprobantePago';
import api from '../api'; 
import Swal from 'sweetalert2'; 

const VistaCaja = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [idAlumno, setIdAlumno] = useState('');
  const [cuotas, setCuotas] = useState([]);
  
  const [periodo, setPeriodo] = useState('');
  const [medioPago, setMedioPago] = useState('Efectivo');
  
  const [tarifas, setTarifas] = useState({ cuotaSocio: '', adicionalFederado: '' });
  const [isTarifasOpen, setIsTarifasOpen] = useState(false);

  const [datosRecibo, setDatosRecibo] = useState(null);
  const componentePDFRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentePDFRef,
    documentTitle: 'Comprobante_Pago_Club_Ajedrez',
  });

  useEffect(() => {
    const fetchAlumnosYTarifas = async () => {
      try {
        const [resAlumnos, resTarifas] = await Promise.all([
          api.get('/alumnos'),
          api.get('/tarifas')
        ]);
        
        setAlumnos(resAlumnos.data);

        const dataTarifas = resTarifas.data;
        const cuotaSocio = dataTarifas.find(t => t.concepto === 'Cuota Socio')?.montoActual || '';
        const adicionalFederado = dataTarifas.find(t => t.concepto === 'Adicional Federado')?.montoActual || '';
        setTarifas({ cuotaSocio, adicionalFederado });
      } catch (error) {
        // Amortiguador silencioso: api.js avisa si no hay conexión
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
      const res = await api.get(`/cuotas/alumno/${id}`);
      setCuotas(res.data);
    } catch (error) {
      // Amortiguador silencioso
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

      await api.put('/tarifas', payload);
      Swal.fire('Operación completada', 'Tarifas actualizadas correctamente.', 'success');      setIsTarifasOpen(false);
    } catch (error) {
       // Amortiguador: api.js ataja el error
    }
  };

  const handleGenerarCuota = async (e) => {
    e.preventDefault();
    if (!idAlumno || !periodo) {
      Swal.fire('Atención', 'Seleccioná un alumno y escribí un periodo.', 'warning');
      return;
    }
    try {
      await api.post('/cuotas/generar', { idAlumno: parseInt(idAlumno), periodo });
      
      // Texto redundante corregido
      Swal.fire('Operación completada', 'Cuota generada correctamente.', 'success');
      
      setPeriodo('');
      fetchCuotas(idAlumno); 
    } catch (error) {
      // MAGIA DEL INTERCEPTOR: Si la cuota ya existe, el backend lanza CuotaDuplicadaException (409).
      // Tu api.js lo atrapa y muestra el SweetAlert amarillo automáticamente. No necesitamos IFs acá.
    }
  };

  const handleImprimirRecibo = async (idPago) => {
    if (!idPago) return;
    try {
      const res = await api.get(`/pagos/${idPago}/comprobante`);
      setDatosRecibo(res.data); 
      
      setTimeout(() => {
        handlePrint();
      }, 100);
    } catch (error) {
      // Amortiguador silencioso
    }
  };

  const handlePagar = async (idCuota) => {
    try {
      const payload = {
        idAlumno: parseInt(idAlumno),
        medioPago: medioPago,
        idsCuotasAPagar: [idCuota] 
      };
      
      await api.post('/pagos', payload);
      Swal.fire('Operación completada', 'Pago registrado correctamente.', 'success');
      fetchCuotas(idAlumno);
      
    } catch (error) {
      // Amortiguador: Si la cuota ya estaba pagada, el backend lanza CuotaYaPagadaException (409)[cite: 1, 3, 6].
      // api.js mostrará el cartel por nosotros.
    }
  };

  const cuotasOrdenadas = [...cuotas].sort((a, b) => {
    if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
    if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
    return a.periodo.localeCompare(b.periodo);
  });
  
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
          <span> 
            
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                  </svg>
            
            Configuración de Valores Actuales</span>
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
                  <label className="form-label">Periodo </label>
                  <input type="month" className="form-control" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required />
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
                    <th>Cobrador</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!idAlumno ? (
                    <tr><td colSpan="5" className="py-4 text-muted">Seleccioná un alumno arriba</td></tr>
                  ) : cuotas.length === 0 ? (
                    <tr><td colSpan="5" className="py-4 text-muted">El alumno no tiene cuotas generadas</td></tr>
                  ) : (
                    cuotasOrdenadas.map(c => (
                      <tr key={c.idCuota}>
                        <td className="fw-bold">{c.periodo}</td>
                        <td>{c.fechaVencimiento}</td>
                        <td>
                          <span className={`badge ${c.estado === 'Pagada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="fw-bold text-success">${c.montoTotal}</td>
                        <td className="text-muted small">{c.cobradoPor || '-'}</td>
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