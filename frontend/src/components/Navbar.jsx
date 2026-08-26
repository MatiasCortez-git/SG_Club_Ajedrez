const Navbar = () => {

  const isLogged = localStorage.getItem('isLogged') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLogged');
    window.location.href = '/'; // Devuelve a la landing y refresca
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="#">
          {/* Logo en la Navbar */}
          <img 
            src="/logo-alianza.png" 
            alt="Logo Alianza Francesa" 
            width="40" 
            height="40" 
            className="d-inline-block align-text-top me-2 bg-white rounded-circle p-1"
          />
          <span className="fw-bold">SG Club de Ajedrez</span>
        </a>
        
        {/* Botón hamburguesa para responsividad en celulares */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-3">
              <span className="nav-link text-white fw-semibold">Sede Paraná</span>
            </li>
            <li className="nav-item">
              {isLogged ? (
                <button onClick={handleLogout} className="btn btn-sm btn-danger fw-bold">Cerrar Sesión</button>
              ) : (
                <a href="/login" className="btn btn-sm btn-light text-primary fw-bold">Acceso Profesores</a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;