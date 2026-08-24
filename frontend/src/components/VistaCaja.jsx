import { useState, useEffect } from 'react';

const VistaCaja = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [idAlumno, setIdAlumno] = useState('');
  const [cuotas, setCuotas] = useState([]);
  
  // Estados para los formularios
  const [periodo, setPeriodo] = useState('');
  const [medioPago, setMedioPago] = useState('Efectivo');

  // 1. Cargar alumnos al iniciar
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/v1/alumnos');
        if (res.ok) setAlumnos(await res.json());
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
      }
    };
    fetchAlumnos();
  }, []);

  // 2. Cargar cuotas CADA VEZ que se selecciona un alumno
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

  // 3. Generar Nueva Cuota
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
        fetchCuotas(idAlumno); // Refresca la tabla automáticamente
      } else {
        alert('Error al generar la cuota.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 4. Pagar una Cuota
  const handlePagar = async (idCuota) => {
    try {
      const payload = {
        idAlumno: parseInt(idAlumno),
        medioPago: medioPago,
        idsCuotasAPagar: [idCuota] // Enviamos el array exacto como pide el backend
      };
      const res = await fetch('http://localhost:8081/api/v1/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.status === 201) {
        alert('¡Pago registrado correctamente!');
        fetchCuotas(idAlumno); // Refresca la tabla para que diga "Pagada"
      } else {
        alert('Error al registrar el pago (¿Quizás ya estaba pagada?).');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Caja: Gestión de Cuotas y Pagos</h2>

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
          <div className="card shadow-sm">
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
          <div className="card shadow-sm">
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
                        <td>${c.montoBase + c.montoFederado + c.montoTalleres}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => handlePagar(c.idCuota)}
                            disabled={c.estado === 'Pagada'}>
                            {c.estado === 'Pagada' ? 'Saldada' : 'Pagar'}
                          </button>
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
    </div>
  );
};

export default VistaCaja;