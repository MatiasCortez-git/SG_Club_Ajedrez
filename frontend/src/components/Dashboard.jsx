import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Panel de Control</h2>
      <div className="row text-center">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Gestión de Alumnos</h5>
              <Link to="/alumnos" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Catálogo de Talleres</h5>
              <Link to="/talleres" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Caja Financiera</h5>
              <Link to="/caja" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Gestión de Profesores</h5>
              <Link to="/profesores" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;