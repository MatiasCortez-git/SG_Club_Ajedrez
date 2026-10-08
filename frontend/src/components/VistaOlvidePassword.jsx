import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const VistaOlvidePassword = () => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enviadoConExito, setEnviadoConExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/auth/solicitar-recuperacion', { 
        username: username,
        email: username 
      });
      setEnviadoConExito(true);
    } catch (error) {
      // Cualquier error de red o 400 es gestionado por el interceptor de api.js
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light px-3">
      <div className="card shadow border-primary" style={{ maxWidth: '450px', width: '100%' }}>
        
        {/* Cabecera institucional con logo centrado y detalle superior en rojo */}
        <div 
          className="card-header bg-primary text-white text-center py-4"
          style={{ borderTop: '4px solid #dc3545' }}
        >
          <img
            src="/logo-alianza-mini.png"
            alt="Logo Alianza Francesa"
            width="56"
            height="56"
            className="bg-white rounded-circle p-1 mb-2 shadow-sm"
          />
          <h5 className="mb-0 fw-bold">Recuperar Contraseña</h5>
          <small className="text-white-50">SG Club de Ajedrez</small>
        </div>

        <div className="card-body p-4">
          {!enviadoConExito ? (
            <>
              <p className="text-muted small text-center mb-4">
                Ingresá tu nombre de usuario y te enviaremos un enlace temporal a tu correo registrado para restablecer tu clave.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Nombre de Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingresá tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando enlace...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className={`btn btn-outline-secondary w-100 btn-sm ${isSubmitting ? 'disabled' : ''}`}
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* Vista de Feedback de Seguridad (Anti-enumeración) */
            <div className="text-center py-2">
              <div className="text-success mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686" />
                </svg>
              </div>

              <div className="alert alert-info border-0 shadow-sm text-start small mb-4">
                Si el usuario ingresado se encuentra registrado en nuestro sistema, recibirás un enlace en tu correo electrónico asociado con las instrucciones para restablecer tu contraseña.
              </div>

              <Link to="/login" className="btn btn-primary w-100 fw-bold py-2 shadow-sm">
                Volver al Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VistaOlvidePassword;