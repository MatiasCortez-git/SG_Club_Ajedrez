import { useState, useEffect } from 'react';

const PortalAlumno = () => {
  const [dni, setDni] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [error, setError] = useState('');
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/api/v1/reportes/ranking')
      .then(res => res.ok ? res.json() : [])
      .then(data => setRanking(data))
      .catch(err => console.error('Error al cargar ranking:', err));
  }, []);

  const buscarDeuda = async (e) => {
    e.preventDefault();
    setError('');
    setAlumno(null);
    setCuotas([]);

    try {
      const resAlumno = await fetch(`http://localhost:8081/api/v1/alumnos/dni/${dni}`);
      if (!resAlumno.ok) {
        setError('No se encontró ningún alumno con ese DNI.');
        return;
      }
      const dataAlumno = await resAlumno.json();
      setAlumno(dataAlumno);

      const resCuotas = await fetch(`http://localhost:8081/api/v1/cuotas/alumno/${dataAlumno.idPersona}`);
      if (resCuotas.ok) setCuotas(await resCuotas.json());
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="container mt-5">
      
      {/* =========================================
          HERO BANNER INSTITUCIONAL (Margen reducido a mb-3)
          ========================================= */}
      <div className="row justify-content-center mb-3">
        <div className="col-md-10 text-center">
          <h1 className="display-5 fw-bold text-primary mb-2">Bienvenido al Club de Ajedrez</h1>
          <p className="lead text-muted mb-3">
            Un espacio de enseñanza, práctica y difusión del ajedrez en la ciudad de Paraná.
          </p>
          <hr className="w-25 mx-auto border-danger border-2 opacity-75" />
        </div>
      </div>

      <div className="row">
        {/* COLUMNA IZQUIERDA: Buscador y Estado de Cuenta */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-primary h-100">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Consultá tu estado arancelario</h4>
            </div>
            <div className="card-body">
              <p className="text-muted small text-center mb-4">
                Ingresá tu número de DNI para conocer tus cuotas pendientes y vencimientos.
              </p>
              
              <form onSubmit={buscarDeuda} className="d-flex gap-2 mb-4">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Ej: 12345678" 
                  value={dni} 
                  onChange={(e) => setDni(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary btn-lg px-4 fw-bold">Consultar</button>
              </form>
              
              {error && <div className="alert alert-danger">{error}</div>}

              {alumno && (
                <div className="border border-info rounded overflow-hidden mt-3 shadow-sm">
                  <div className="bg-info text-dark p-2 text-center fw-bold border-bottom border-info">
                    Tus Movimientos
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped mb-0 text-center align-middle">
                      <thead className="table-light">
                        <tr><th>Periodo</th><th>Vencimiento</th><th>Estado</th><th>Total</th></tr>
                      </thead>
                      <tbody>
                        {cuotas.length === 0 ? (
                          <tr><td colSpan="4" className="py-3 text-muted">No tenés cuotas generadas.</td></tr>
                        ) : (
                          cuotas.map(c => (
                            <tr key={c.idCuota}>
                              <td className="fw-bold text-secondary">{c.periodo}</td>
                              <td>{c.fechaVencimiento}</td>
                              <td>
                                <span className={`badge ${c.estado === 'Pagada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {c.estado}
                                </span>
                              </td>
                              <td className="fw-bold text-success">${c.montoTotal}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Top 5 Jugadores Federados */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-warning h-100">
            <div className="card-header bg-warning text-dark text-center">
              <h4 className="mb-0 fw-bold">🏆 Top 5 Jugadores Federados</h4>
            </div>
            <div className="card-body p-0 table-responsive">
              <table className="table table-hover table-striped mb-0 text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '15%' }}>Top</th>
                    <th style={{ width: '55%' }}>Jugador</th>
                    <th style={{ width: '30%' }}>Puntaje ELO</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-muted">Aún no hay jugadores registrados en el ranking.</td>
                    </tr>
                  ) : (
                    ranking.slice(0, 5).map((jugador, index) => (
                      <tr key={jugador.dni}>
                        <td className="fw-bold fs-5 text-warning">{index + 1}</td>
                        <td className="text-start ps-3 fw-semibold">{jugador.nombreCompleto}</td>
                        <td className="fw-bold text-danger fs-6">{jugador.elo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-light text-center text-muted small border-top-0">
              Ranking oficial actualizado automáticamente.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortalAlumno;