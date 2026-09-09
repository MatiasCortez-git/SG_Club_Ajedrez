import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1'
});

// Interceptor para inyectar el token en las peticiones
api.interceptors.request.use(
  (config) => {
    // Usamos sessionStorage respetando nuestro parche de seguridad previo
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar expulsiones (Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Tu sesión ha expirado o no tienes permisos. Vuelve a ingresar.');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isLogged');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;