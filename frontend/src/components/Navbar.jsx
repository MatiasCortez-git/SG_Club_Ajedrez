import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [username, setUsername] = useState('Usuario');
  const dropdownRef = useRef(null);
  
  // Hook para saber en qué ruta estamos parados
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Verificamos sesión activa (solo cuando ya pasó el primer ingreso)
  const isLogged = sessionStorage.getItem('isLogged') === 'true';

  // Extracción nativa del claim 'sub' (email) desde el JWT
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (payload.sub) {
          setUsername(payload.sub);
        }
      } catch (error) {
        console.error('Error al decodificar el JWT:', error);
      }
    }
  }, [isLogged]);

  // Cierra el menú desplegable de PC si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsNavCollapsed(true);
    setDropdownAbierto(false);
    
    sessionStorage.clear();
    localStorage.clear();
    
    window.location.href = '/login'; 
  };

  const obtenerInicial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  // CERROJO VISUAL: Oculta por completo el Navbar en la pantalla de activación (/primer-ingreso)
  if (location.pathname === '/primer-ingreso') {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        
        {/* LOGO DINÁMICO CON LA NUEVA IMAGEN */}
        <Link 
          className="navbar-brand d-flex align-items-center" 
          to={isLogged ? '/dashboard' : '/'}
          onClick={() => setIsNavCollapsed(true)}
        >
          <img 
            src="/logo-alianza-mini.png" 
            alt="Logo Alianza Francesa" 
            width="40" 
            height="40" 
            className="d-inline-block align-text-top me-2 bg-white rounded-circle p-1"
          />
          <span className="fw-bold">SG Club de Ajedrez</span>
        </Link>
        
        {/* El botón hamburguesa se oculta si estamos en /login y no hay sesión */}
        {(isLogged || !isLoginPage) && (
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        )}
        
        <div className={`${isNavCollapsed ? 'collapse' : 'collapse show'} navbar-collapse`} id="navbarNav">
          {isLogged ? (
            <>
              {/* =========================================================
                  1. COMPORTAMIENTO EN PC (Pantallas Grandes): Dropdown
                 ========================================================= */}
              <ul className="navbar-nav ms-auto d-none d-lg-flex align-items-center">
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center text-white text-decoration-none border-0"
                    onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  >
                    <div
                      className="rounded-circle bg-white text-primary fw-bold d-flex justify-content-center align-items-center me-2 shadow-sm"
                      style={{ width: '36px', height: '36px', fontSize: '1rem' }}
                    >
                      {obtenerInicial(username)}
                    </div>
                    <span className="fw-semibold">{username}</span>
                  </button>

                  {/* Ventana flotante del Dropdown con SVGs profesionales */}
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${
                      dropdownAbierto ? 'show' : ''
                    }`}
                    style={{ right: 0, left: 'auto' }}
                  >
                    <li>
                      <Link
                        className="dropdown-item py-2 d-flex align-items-center"
                        to="/mi-perfil"
                        onClick={() => setDropdownAbierto(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2 text-secondary" viewBox="0 0 16 16">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                        </svg>
                        Mi Perfil
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item py-2 text-danger fw-bold d-flex align-items-center"
                        onClick={handleLogout}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                          <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                        </svg>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>

              {/* =========================================================
                  2. COMPORTAMIENTO EN MÓVIL / TABLET: Lista Vertical
                 ========================================================= */}
              <div className="d-lg-none mt-3 pt-3 border-top border-light border-opacity-25">
                <div className="d-flex align-items-center mb-3 px-2">
                  <div
                    className="rounded-circle bg-white text-primary fw-bold d-flex justify-content-center align-items-center me-3 shadow-sm"
                    style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}
                  >
                    {obtenerInicial(username)}
                  </div>
                  <div className="text-white overflow-hidden">
                    <small className="d-block text-white-50" style={{ fontSize: '0.75rem' }}>
                      Sesión activa
                    </small>
                    <span className="fw-bold text-truncate d-block">{username}</span>
                  </div>
                </div>

                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white fw-semibold py-2 px-2 d-flex align-items-center"
                      to="/mi-perfil"
                      onClick={() => setIsNavCollapsed(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                      </svg>
                      Mi Perfil
                    </Link>
                  </li>
                  <li className="nav-item mt-2 mb-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-sm btn-danger w-100 fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* =========================================================
               VISTA PÚBLICA: Oculta el botón si ya estamos en /login
               ========================================================= */
            !isLoginPage && (
              <ul className="navbar-nav ms-auto align-items-center mt-3 mt-lg-0">
                <li className="nav-item w-100 text-end">
                  <Link 
                    to="/login" 
                    className="btn btn-sm btn-light text-primary fw-bold shadow-sm" 
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    Acceso Administrativo
                  </Link>
                </li>
              </ul>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;