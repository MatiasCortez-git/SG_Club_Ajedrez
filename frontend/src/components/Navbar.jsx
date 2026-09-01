import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const isLogged = localStorage.getItem('isLogged') === 'true';

  const handleLogout = () => {
    setIsNavCollapsed(true);
    localStorage.removeItem('isLogged');
    window.location.href = '/'; 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        
        {/* 1. LOGO DINÁMICO: Navega a /dashboard o / según la sesión */}
        <Link className="navbar-brand d-flex align-items-center" to={isLogged ? '/dashboard' : '/'}>
          <img 
            src="/logo-alianza.png" 
            alt="Logo Alianza Francesa" 
            width="40" 
            height="40" 
            className="d-inline-block align-text-top me-2 bg-white rounded-circle p-1"
          />
          <span className="fw-bold">SG Club de Ajedrez</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`${isNavCollapsed ? 'collapse' : 'collapse show'} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            {/* 2. ENLACE EXPLÍCITO: Solo visible si el usuario inició sesión */}
            {isLogged && (
              <li className="nav-item me-3">
                <Link 
                  to="/dashboard" 
                  className="nav-link text-white fw-bold"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  Panel de Control
                </Link>
              </li>
            )}

            <li className="nav-item me-3">
              <span className="nav-link text-white-50 fw-semibold">Sede Paraná</span>
            </li>
            
            <li className="nav-item">
              {isLogged ? (
                <button 
                  onClick={handleLogout} 
                  className="btn btn-sm btn-danger fw-bold"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="btn btn-sm btn-light text-primary fw-bold" 
                  onClick={() => setIsNavCollapsed(true)}
                >
                  Acceso Profesores
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;