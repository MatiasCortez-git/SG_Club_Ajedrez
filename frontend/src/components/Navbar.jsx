import { useState } from 'react';

const Navbar = () => {
  // 1. Declaramos el estado para controlar el menú
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  
  const isLogged = localStorage.getItem('isLogged') === 'true';

  const handleLogout = () => {
    // 2. Cierre Automático al salir
    setIsNavCollapsed(true);
    localStorage.removeItem('isLogged');
    window.location.href = '/'; 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img 
            src="/logo-alianza.png" 
            alt="Logo Alianza Francesa" 
            width="40" 
            height="40" 
            className="d-inline-block align-text-top me-2 bg-white rounded-circle p-1"
          />
          <span className="fw-bold">SG Club de Ajedrez</span>
        </a>
        
        {/* 3. Botón disparador con evento onClick (Sin los data-bs de Bootstrap) */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* 4. Renderizado Condicional del contenedor del menú */}
        <div className={`${isNavCollapsed ? 'collapse' : 'collapse show'} navbar-collapse`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-3">
              <span className="nav-link text-white fw-semibold">Sede Paraná</span>
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
                <a 
                  href="/login" 
                  className="btn btn-sm btn-light text-primary fw-bold" 
                  onClick={() => setIsNavCollapsed(true)} // 5. Cierre Automático al entrar
                >
                  Acceso Profesores
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;