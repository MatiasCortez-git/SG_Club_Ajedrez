import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, PieChart, Pie, Cell
} from 'recharts';

const VistaEstadisticas = () => {
  const rol = sessionStorage.getItem('rol');
  const esAdmin = rol === 'ROLE_ADMIN';

  const [tabActiva, setTabActiva] = useState('OCUPACION');
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState({
    ocupacion: [],
    recaudacion: [],
    demografia: []
  });

  // Colores Institucionales
  const COLOR_AZUL = '#0055A4';
  const COLOR_ROJO = '#EF4135';
  const COLOR_VERDE = '#28a745';
  const COLOR_AMARILLO = '#ffc107';
  const COLORES_PIE = [COLOR_AZUL, COLOR_ROJO, COLOR_VERDE, COLOR_AMARILLO, '#17a2b8'];

  // Carga Perezosa (Lazy Fetching) según pestaña activa
  useEffect(() => {
    if (!esAdmin) return;

    const fetchDatos = async () => {
      setCargando(true);
      try {
        if (tabActiva === 'OCUPACION' && datos.ocupacion.length === 0) {
          const res = await api.get('/reportes/estadisticas/ocupacion');
          setDatos(prev => ({ ...prev, ocupacion: res.data }));
        } else if (tabActiva === 'CAJA' && datos.recaudacion.length === 0) {
          const res = await api.get('/reportes/estadisticas/recaudacion');
          setDatos(prev => ({ ...prev, recaudacion: res.data }));
        } else if (tabActiva === 'DEMOGRAFIA' && datos.demografia.length === 0) {
          const res = await api.get('/reportes/estadisticas/demografia');
          setDatos(prev => ({ ...prev, demografia: res.data }));
        }
      } catch (error) {
        // api.js maneja automáticamente los errores 403 o 500
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, [tabActiva, esAdmin, datos.ocupacion.length, datos.recaudacion.length, datos.demografia.length]);

  // Lógica Genérica de Descarga CSV
  const handleDescargarCSV = async (endpoint, nombreArchivo) => {
    try {
      Swal.fire({ title: 'Generando archivo...', allowOutsideClick: false });
      Swal.showLoading();

      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.close();
    } catch (error) {
      Swal.fire('Error', 'No se pudo generar el archivo CSV.', 'error');
    }
  };

  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 text-center text-primary fw-bold">Panel de Análisis Gerencial</h2>

      {/* Menú de Pestañas */}
      <ul className="nav nav-tabs mb-4 justify-content-center">
        <li className="nav-item">
          <button 
            className={`nav-link text-uppercase fw-bold ${tabActiva === 'OCUPACION' ? 'active text-primary' : 'text-secondary'}`} 
            onClick={() => setTabActiva('OCUPACION')}
            disabled={cargando}
          >
            Ocupación y Rentabilidad
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link text-uppercase fw-bold ${tabActiva === 'CAJA' ? 'active text-success' : 'text-secondary'}`} 
            onClick={() => setTabActiva('CAJA')}
            disabled={cargando}
          >
            Flujo de Caja
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link text-uppercase fw-bold ${tabActiva === 'DEMOGRAFIA' ? 'active text-danger' : 'text-secondary'}`} 
            onClick={() => setTabActiva('DEMOGRAFIA')}
            disabled={cargando}
          >
            Demografía
          </button>
        </li>
      </ul>

      {/* Estado de Carga */}
      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted fw-semibold">Procesando métricas...</p>
        </div>
      )}

      {/* SECCIÓN 1: OCUPACIÓN Y RENTABILIDAD */}
      {!cargando && tabActiva === 'OCUPACION' && (
        <div className="card shadow-sm border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Rentabilidad Proyectada por Taller</h5>
            <button 
              className="btn btn-sm btn-light text-primary fw-bold" 
              onClick={() => handleDescargarCSV('/reportes/estadisticas/ocupacion/csv', 'rentabilidad_talleres')}
            >
              Descargar CSV
            </button>
          </div>
          <div className="card-body">
            {datos.ocupacion.length === 0 ? (
              <p className="text-muted text-center py-4">No hay datos de ocupación disponibles.</p>
            ) : (
              <>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={datos.ocupacion} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombreTaller" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="rentabilidadProyectada" name="Rentabilidad ($)" fill={COLOR_AZUL} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="table-responsive mt-4">
                  <table className="table table-striped text-center align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Taller</th>
                        <th>Nivel</th>
                        <th>Ocupación</th>
                        <th>Porcentaje</th>
                        <th>Rentabilidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.ocupacion.map((t, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{t.nombreTaller}</td>
                          <td><span className="badge bg-secondary">{t.nivel}</span></td>
                          <td>{t.inscriptosReales} / {t.cupoMaximo}</td>
                          <td className="fw-bold">{t.porcentajeOcupacion}%</td>
                          <td className="fw-bold text-success">${t.rentabilidadProyectada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: FLUJO DE CAJA */}
      {!cargando && tabActiva === 'CAJA' && (
        <div className="card shadow-sm border-success">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Análisis de Recaudación y Morosidad</h5>
            <button 
              className="btn btn-sm btn-light text-success fw-bold" 
              onClick={() => handleDescargarCSV('/reportes/estadisticas/recaudacion/csv', 'flujo_caja')}
            >
              Descargar CSV
            </button>
          </div>
          <div className="card-body">
            {datos.recaudacion.length === 0 ? (
              <p className="text-muted text-center py-4">No hay datos financieros disponibles.</p>
            ) : (
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={datos.recaudacion} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="ingresosCobrados" name="Ingresos Cobrados ($)" fill={COLOR_VERDE} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="capitalRetenido" name="Capital en Mora ($)" stroke={COLOR_ROJO} strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 3: DEMOGRAFÍA */}
      {!cargando && tabActiva === 'DEMOGRAFIA' && (
        <div className="card shadow-sm border-danger">
          <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Distribución de Alumnos por Nivel</h5>
            <button 
              className="btn btn-sm btn-light text-danger fw-bold" 
              onClick={() => handleDescargarCSV('/reportes/estadisticas/demografia/csv', 'demografia')}
            >
              Descargar CSV
            </button>
          </div>
          <div className="card-body">
            {datos.demografia.length === 0 ? (
              <p className="text-muted text-center py-4">No hay datos demográficos disponibles.</p>
            ) : (
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={datos.demografia}
                          dataKey="cantidadAlumnos"
                          nameKey="nivelTaller"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          label={(entry) => `${entry.nivelTaller} (${entry.cantidadAlumnos})`}
                        >
                          {datos.demografia.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-secondary text-center mb-3">Detalle de Edades</h6>
                  <ul className="list-group shadow-sm">
                    {datos.demografia.map((d, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="fw-semibold" style={{ color: COLORES_PIE[i % COLORES_PIE.length] }}>
                          {d.nivelTaller}
                        </span>
                        <div className="text-end">
                          <span className="d-block small text-muted">Edad Promedio: <strong>{d.edadPromedio} años</strong></span>
                          <span className="d-block small text-muted">Rango: {d.edadMinima} a {d.edadMaxima} años</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaEstadisticas;