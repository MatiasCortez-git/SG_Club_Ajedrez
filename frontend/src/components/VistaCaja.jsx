import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ComprobantePago from './ComprobantePago';

const VistaCaja = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [idAlumno, setIdAlumno] = useState('');
  const [cuotas, setCuotas] = useState([]);
  const [periodo, setPeriodo] = useState('');
  const [medioPago, setMedioPago] = useState('Efectivo');
  
  // Estados para el Modal de Impresión
  const [showModal, setShowModal] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState(null);
  
  const componentePDFRef = useRef();

// Reemplazamos por esta sintaxis actualizada:
const handlePrint = useReactToPrint({
  contentRef: componentePDFRef,
  documentTitle: `Recibo_Ajedrez_${datosRecibo?.idPago || ''}`,
});

  // Cargar alumnos al iniciar
  useEffect(() => {
    fetch('http://localhost:8081/api/v1/alumnos')
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(err => console.error(err));
  }, []);

  // Cargar cuotas CADA VEZ que se selecciona un alumno
  const fetchCuotas = async (id) => {
    if (!id) { setCuotas([]); return; }
    try {
      const res = await fetch(`http://localhost:8081/api/v1/cuotas/alumno/${id}`);
      if (res.ok) setCuotas(await res.json());
    } catch (error) { console.error('Error al cargar cuotas:', error); }
  };

  useEffect(() => { fetchCuotas(idAlumno); }, [idAlumno]);

  // Generar Nueva Cuota
  const handleGenerarCuota = async (e) => {
    e.preventDefault();
    if (!idAlumno || !periodo) return;
    try {
      const res = await fetch('http://localhost:8081/api/v1/cuotas/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idAlumno: parseInt(idAlumno), periodo })
      });
      
      if (res.status === 201) {
        alert('¡Cuota generada con éxito!'); // (Acá podrías usar Swal.fire de SweetAlert)
        setPeriodo('');
        fetchCuotas(idAlumno);
      } else if (res.status === 409) {
        // PUNTO 2: ATRAPAMOS EL CONFLICTO Y MOSTRAMOS EL MENSAJE DEL BACKEND
        const errorData = await res.json();
        alert(`Atención: ${errorData.mensaje || errorData.error}`);
      } else {
        alert('Ocurrió un error inesperado al generar la cuota.');
      }
    } catch (error) { console.error('Error:', error); }
  };

  // Pagar una Cuota (Ahora es silencioso, sin modal)
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
      
      if (res.status === 201) {
        alert('¡Pago registrado correctamente!');
        fetchCuotas(idAlumno); // Se actualiza la tabla mostrando el botón de imprimir
      } else {
        alert('Error al registrar el pago.');
      }
    } catch (error) { console.error('Error:', error); }
  };

  // NUEVO: Función para buscar los datos del recibo y abrir el Modal
  const handleAbrirComprobante = async (idPago) => {
    if (!idPago) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/pagos/${idPago}/comprobante`);
      if (res.ok) {
        const data = await res.json();
        setDatosRecibo(data);
        setShowModal(true); // Abrimos el modal SOLO cuando tenemos los datos listos
      } else {
        alert('No se pudo obtener el comprobante.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Caja: Gestión de Cuotas y Pagos</h2>

      {/* Buscador Principal */}
      <div className="card shadow-sm mb-4 border-info">
        <div className="card-body">
          <label className="form-label fw-bold">Seleccionar Alumno</label>
          <select className="form-select" value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)}>
            <option value="">-- Elegir Alumno --</option>
            {alumnos.map(a => (
              <option key={a.idPersona} value={a.idPersona}>{a.nombre} {a.apellido} (DNI: {a.dni})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {/* Panel Izquierdo: Generar Cuota */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white">Generar Nueva Cuota</div>
            <div className="card-body">
              <form onSubmit={handleGenerarCuota}>
                <div className="mb-3">
                  <label className="form-label">Periodo (Ej: 2026-09)</label>
                  <input type="text" className="form-control" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={!idAlumno}>Generar Cuota</button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Tabla de Cuotas y Pagos */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <span>Estado de Cuenta</span>
              <select className="form-select form-select-sm w-auto" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="MercadoPago">MercadoPago</option>
              </select>
            </div>
            <div className="card-body p-0 table-responsive">
              <table className="table table-striped table-hover mb-0 text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!idAlumno ? (
                    <tr><td colSpan="4" className="py-4 text-muted">Seleccioná un alumno arriba</td></tr>
                  ) : cuotas.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 text-muted">No hay cuotas registradas</td></tr>
                  ) : (
                    cuotas.map(c => (
                      <tr key={c.idCuota}>
                        <td className="fw-bold">{c.periodo}</td>
                        <td>
                          <span className={`badge ${c.estado === 'Pagada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="fw-bold">${c.montoTotal}</td>
                        <td>
                          {/* LOGICA DEL BOTON: Si está pagada, mostramos Imprimir. Si no, mostramos Pagar */}
                          {c.estado === 'Pagada' ? (
                            <button 
                              className="btn btn-sm btn-outline-info fw-bold"
                              // Nota: Asegurate de que el backend devuelva el objeto "pago" o el "id_pago" en el JSON de la Cuota
                              onClick={() => handleAbrirComprobante(c.idPago)}
                            >
                              🖨️ Imprimir
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => handlePagar(c.idCuota)}>
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

      {/* Modal de Impresión (Se abre a demanda) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Previsualización de Recibo</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body bg-light">
                <div className="border rounded bg-white p-2 mb-3 shadow-sm mx-auto" style={{ maxHeight: '400px', overflowY: 'auto', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                  {/* Le pasamos todos los datos digeridos por el backend */}
                  <ComprobantePago ref={componentePDFRef} datos={datosRecibo} />
                </div>
              </div>
              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                <button type="button" className="btn btn-primary btn-lg px-5" onClick={handlePrint}>🖨️ Imprimir PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaCaja;