import { useState } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const VistaPrimerIngreso = () => {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (nuevaPassword.length < 6) {
      setErrorLocal('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorLocal('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put('/perfil/me/activar-cuenta', {
        nuevaPassword: nuevaPassword,
        passwordNueva: nuevaPassword,
        confirmarPassword: confirmarPassword
      });

      // Liberamos la cuarentena y activamos la bandera de sesión iniciada
      sessionStorage.setItem('debe_cambiar_password', 'false');
      sessionStorage.setItem('isLogged', 'true');

      await Swal.fire({
        icon: 'success',
        title: '¡Cuenta Activada!',
        text: 'Tu contraseña se ha actualizado correctamente. Bienvenido al sistema.',
        confirmButtonColor: '#0d6efd',
        allowOutsideClick: false
      });

      window.location.href = '/dashboard';
    } catch (error) {
      // Manejado globalmente por api.js
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light px-3">
      <div className="card shadow border-primary" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="mb-2" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
          </svg>
          <h5 className="mb-0 fw-bold">Activación de Cuenta</h5>
          <small className="text-white-50">Primer ingreso detectado</small>
        </div>
        
        <div className="card-body p-4">
          <p className="text-muted small text-center mb-4">
            Por razones de seguridad, debés definir una contraseña personal antes de acceder al panel de control del club.
          </p>

          {errorLocal && (
            <div className="alert alert-danger p-2 small fw-semibold text-center">
              {errorLocal}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nueva Contraseña</label>
              <div className="input-group">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center" 
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{ width: '45px' }}
                  disabled={isSubmitting}
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                      <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirmar Nueva Contraseña</label>
              <input
                type={mostrarPassword ? "text" : "password"}
                className="form-control"
                placeholder="Repetí la contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold py-2 mb-2 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Activando cuenta...
                </>
              ) : (
                'Guardar y Continuar'
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 btn-sm mt-2"
              onClick={handleCancelar}
              disabled={isSubmitting}
            >
              Cancelar y volver al Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VistaPrimerIngreso;