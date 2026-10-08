import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Regla de Renderizado Condicional: Ocultar en vistas de acceso público o bloqueo de seguridad
  const rutasSinFooter = [
    '/login',
    '/primer-ingreso',
    '/olvide-password',
    '/reset-password'
  ];

  if (rutasSinFooter.includes(location.pathname)) {
    return null;
  }

  return (
    <footer
      className="bg-dark text-white mt-auto py-3 shadow-sm"
      style={{ borderTop: '3px solid #dc3545' }}
    >
      <div className="container">
        <div className="row align-items-center gy-2 text-center text-md-start">
          
          {/* Izquierda / Centro: Nombre del sistema y pertenencia institucional */}
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <img
                src="/logo-alianza-mini.png"
                alt="Alianza Francesa"
                width="24"
                height="24"
                className="bg-white rounded-circle p-1 me-2"
              />
              <span className="small fw-semibold">
                SG Club de Ajedrez — Alianza Francesa <span className="text-white-50">|</span> Sede Paraná
              </span>
            </div>
          </div>

          {/* Derecha: Afiliación deportiva y año actual */}
          <div className="col-12 col-md-6 text-center text-md-end">
            <span className="small text-white-50">
              Afiliado a la Federación Entrerriana de Ajedrez &bull; &copy; 2026
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;