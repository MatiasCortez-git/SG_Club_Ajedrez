import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

// Subcomponente limpio para el ícono del ojo (evita líneas gigantes repetidas)
const IconoOjo = ({ abierto }) => {
  if (abierto) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
    </svg>
  );
};

const VistaPerfil = () => {
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [guardandoContacto, setGuardandoContacto] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: ''
  });

  const [passwords, setPasswords] = useState({
    passwordActual: '',
    nuevaPassword: '',
    repetirPassword: ''
  });
  const [errorPassword, setErrorPassword] = useState('');

  // 1. Carga inicial desde GET /api/v1/perfil/me
  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        const res = await api.get('/perfil/me');
        setPerfil({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          dni: res.data.dni || '',
          email: res.data.email || '',
          telefono: res.data.telefono || ''
        });
      } catch (error) {
        // Manejado globalmente por api.js
      } finally {
        setLoadingPerfil(false);
      }
    };

    cargarDatosPerfil();
  }, []);

  // 2. Guardar únicamente Email y Teléfono
  const handleContactoSubmit = async (e) => {
    e.preventDefault();
    setGuardandoContacto(true);

    try {
      const payloadContacto = {
        email: perfil.email,
        telefono: perfil.telefono
      };

      await api.put('/perfil/me/contacto', payloadContacto);
      Swal.fire(
        'Operación completada',
        'Tus datos de contacto fueron actualizados con éxito.',
        'success'
      );
    } catch (error) {
      // Manejado globalmente por api.js
    } finally {
      setGuardandoContacto(false);
    }
  };

  // 3. Cambio voluntario de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorPassword('');

    if (passwords.nuevaPassword.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (passwords.nuevaPassword !== passwords.repetirPassword) {
      setErrorPassword('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (passwords.passwordActual === passwords.nuevaPassword) {
      setErrorPassword('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setGuardandoPassword(true);

    try {
      const payloadPassword = {
        passwordActual: passwords.passwordActual,
        actualPassword: passwords.passwordActual,
        nuevaPassword: passwords.nuevaPassword,
        passwordNueva: passwords.nuevaPassword
      };

      await api.put('/perfil/me/password', payloadPassword);

      Swal.fire(
        'Operación completada',
        'Tu contraseña ha sido modificada correctamente.',
        'success'
      );
      setPasswords({ passwordActual: '', nuevaPassword: '', repetirPassword: '' });
    } catch (error) {
      // Manejado globalmente por api.js
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (loadingPerfil) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted fw-semibold">Cargando información de tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 text-primary fw-bold text-center">Mi Perfil</h2>

      <div className="row g-4">
        {/* TARJETA 1: Datos de Identidad y Contacto */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-primary h-100">
            <div className="card-header bg-primary text-white py-3 d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
              </svg>
              <h5 className="mb-0 fw-semibold">Información Personal y Contacto</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleContactoSubmit}>
                <h6 className="text-secondary border-bottom pb-2 mb-3">
                  Datos de Identidad (Sólo lectura por auditoría)
                </h6>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Nombre</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-10 text-muted"
                      value={perfil.nombre}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Apellido</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-10 text-muted"
                      value={perfil.apellido}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-semibold">DNI</label>
                  <input
                    type="text"
                    className="form-control bg-secondary bg-opacity-10 text-muted"
                    value={perfil.dni}
                    disabled
                    readOnly
                  />
                </div>

                <h6 className="text-secondary border-bottom pb-2 mb-3 mt-4">
                  Datos de Contacto (Editables)
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                    required
                    disabled={guardandoContacto}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                    required
                    disabled={guardandoContacto}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                  disabled={guardandoContacto}
                >
                  {guardandoContacto ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando cambios...
                    </>
                  ) : (
                    'Actualizar Contacto'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* TARJETA 2: Cambio Voluntario de Contraseña */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-primary h-100">
            <div className="card-header bg-dark text-white py-3 d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
              </svg>
              <h5 className="mb-0 fw-semibold">Seguridad y Contraseña</h5>
            </div>

            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted small mb-4">
                  Si deseás modificar tu clave de acceso actual, completá los siguientes campos. Asegurate de elegir una contraseña segura.
                </p>

                {errorPassword && (
                  <div className="alert alert-danger p-2 small fw-semibold text-center">
                    {errorPassword}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Contraseña Actual</label>
                    <div className="input-group">
                      <input
                        type={mostrarActual ? "text" : "password"}
                        className="form-control"
                        value={passwords.passwordActual}
                        onChange={(e) => setPasswords({ ...passwords, passwordActual: e.target.value })}
                        required
                        disabled={guardandoPassword}
                      />
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        type="button"
                        onClick={() => setMostrarActual(!mostrarActual)}
                        style={{ width: '45px' }}
                        disabled={guardandoPassword}
                      >
                        <IconoOjo abierto={mostrarActual} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nueva Contraseña</label>
                    <div className="input-group">
                      <input
                        type={mostrarNueva ? "text" : "password"}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        value={passwords.nuevaPassword}
                        onChange={(e) => setPasswords({ ...passwords, nuevaPassword: e.target.value })}
                        required
                        disabled={guardandoPassword}
                      />
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        type="button"
                        onClick={() => setMostrarNueva(!mostrarNueva)}
                        style={{ width: '45px' }}
                        disabled={guardandoPassword}
                      >
                        <IconoOjo abierto={mostrarNueva} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Repetir Nueva Contraseña</label>
                    <input
                      type={mostrarNueva ? "text" : "password"}
                      className="form-control"
                      value={passwords.repetirPassword}
                      onChange={(e) => setPasswords({ ...passwords, repetirPassword: e.target.value })}
                      required
                      disabled={guardandoPassword}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 fw-bold py-2 shadow-sm"
                    disabled={guardandoPassword}
                  >
                    {guardandoPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Actualizando contraseña...
                      </>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPerfil;