import { useState } from 'react';
import api from '../api'; // Importamos nuestro Axios configurado

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Petición al endpoint real de Spring Boot
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      // Guardamos el token y la bandera en sessionStorage
      sessionStorage.setItem('token', response.data.jwt);
      sessionStorage.setItem('isLogged', 'true');
      
      // Redirigimos al panel forzando la recarga para el Navbar
      window.location.href = '/dashboard';
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Acceso denegado: Credenciales incorrectas');
      } else {
        setError('Error de conexión con el servidor');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow border-primary">
            <div className="card-header bg-primary text-white text-center">
              <h5>Acceso Administrativo</h5>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger p-2">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;