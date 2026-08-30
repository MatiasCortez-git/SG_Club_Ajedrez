import { useState } from 'react';

const PortalAlumno = () => {
  const [dni, setDni] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [error, setError] = useState('');

  const buscarDeuda = async (e) => {
    e.preventDefault();
    setError('');
    setAlumno(null);
    setCuotas([]);

    try {
      // 1. Buscar Alumno por DNI
      const resAlumno = await fetch(`http://localhost:8081/api/v1/alumnos/dni/${dni}`);
      if (!resAlumno.ok) {
        setError('No se encontró ningún alumno con ese DNI.');
        return;
      }
      const dataAlumno = await resAlumno.json();
      setAlumno(dataAlumno);

      // 2. Buscar sus cuotas
      const resCuotas = await fetch(`http://localhost:8081/api/v1/cuotas/alumno/${dataAlumno.idPersona}`);
      if (resCuotas.ok) {
        setCuotas(await resCuotas.json());
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center mb-4">
          <h2 className="text-primary mb-3">Consulta de Estado de Cuenta</h2>
          <form onSubmit={buscarDeuda} className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control form-control-lg" 
              placeholder="Ingresá tu DNI" 
              value={dni} 
              onChange={(e) => setDni(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary btn-lg">Consultar</button>
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>

      {alumno && (
        <div className="card shadow-sm border-info mt-3">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Hola, {alumno.nombre} {alumno.apellido}</h5>
          </div>
          <div className="card-body p-0 table-responsive">
            <table className="table table-striped mb-0 text-center align-middle">
              <thead className="table-light">
                <tr><th>Periodo</th><th>Vencimiento</th><th>Estado</th><th>Total</th></tr>
              </thead>
              <tbody>
                {cuotas.length === 0 ? (
                  <tr><td colSpan="4" className="py-4">No tenés cuotas generadas.</td></tr>
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
                      <td className="fw-bold">${c.montoTotal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalAlumno;