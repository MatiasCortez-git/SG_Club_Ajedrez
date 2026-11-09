import { Link } from 'react-router-dom';

const Dashboard = () => {
  const rolUsuario = sessionStorage.getItem('rol');

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 text-center text-primary fw-bold">Panel de Control</h2>
      <div className="row text-center">
        
        {/* MÓDULOS GENERALES */}
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
        
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Reportes Gerenciales</h5>
              <Link to="/reportes" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Gestión de Inscripciones</h5>
              <Link to="/inscripciones" className="btn btn-outline-primary mt-3">Ingresar</Link>
            </div>
          </div>
        </div>

        {/* =========================================
            MÓDULO DE INTELIGENCIA ARTIFICIAL
            Visible solo para Profesores y Administradores
           ========================================= */}
        {(rolUsuario === 'ROLE_ADMIN' || rolUsuario === 'ROLE_PROFESOR') && (
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm h-100 border-info">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title text-info fw-bold d-flex justify-content-center align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732l.258-.774z"/>
                  </svg>
                  Asistente IA (Llama 3.2)
                </h5>
                <Link to="/asistente-ia" className="btn btn-outline-info mt-3 fw-bold">Ingresar</Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            MÓDULOS DE ADMINISTRADOR EXCLUSIVO
           ========================================= */}
        {rolUsuario === 'ROLE_ADMIN' && (
          <>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm h-100 border-success">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-title text-success d-flex justify-content-center align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
                    </svg>
                    Análisis Estadístico
                  </h5>
                  <Link to="/estadisticas" className="btn btn-outline-success mt-3">Ingresar</Link>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card shadow-sm h-100 border-danger">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-title text-danger d-flex justify-content-center align-items-center"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                    Panel Administrador
                  </h5>
                  <Link to="/panel-admin" className="btn btn-outline-danger mt-3">Ingresar</Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;