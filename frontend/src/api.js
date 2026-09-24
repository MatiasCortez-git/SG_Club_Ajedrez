import axios from 'axios';
import Swal from 'sweetalert2';

let isSessionExpiredAlertShown = false;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    console.error("Interceptado por Axios:", error);

    if (error.response) {
      const status = error.response.status;
      
      let mensajeBackend = 'Ocurrió un error inesperado';
      if (typeof error.response.data === 'string') {
          mensajeBackend = error.response.data;
      } else if (error.response.data?.mensaje) {
          mensajeBackend = error.response.data.mensaje;
      }

      switch (status) {
        case 400: 
          Swal.fire({
            icon: 'warning',
            title: 'Validación Incorrecta',
            text: mensajeBackend,
            confirmButtonColor: '#f8bb86'
          });
          break;

        case 401:  
          if (window.location.pathname !== '/login') {
            if (!isSessionExpiredAlertShown) {
                    isSessionExpiredAlertShown = true; // Bloqueamos la puerta
                    
                    Swal.fire({
                      title: 'Sesión Expirada',
                      text: 'Por seguridad, tu sesión ha caducado. Por favor, iniciá sesión nuevamente.',
                      icon: 'warning',
                      confirmButtonText: 'Entendido',
                      confirmButtonColor: '#3085d6',
                      allowOutsideClick: false,
                      allowEscapeKey: false
                    }).then((result) => {
                      // Validamos explícitamente que el cierre fue por apretar el botón
                      if (result.isConfirmed) {
                          isSessionExpiredAlertShown = false; // Liberamos la puerta
                          sessionStorage.clear();
                          window.location.href = '/login';
                      }
                    });
                }
          }
          break;

        case 403: 
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: mensajeBackend,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000
          });
          break;

        case 404: 
          if (window.location.pathname !== '/') {
            Swal.fire({
              icon: 'info',
              title: 'No encontrado',
              text: mensajeBackend,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
          }
          break;

        case 409: 
          Swal.fire({
            icon: 'warning',
            title: 'Conflicto de Operación',
            text: mensajeBackend,
            confirmButtonColor: '#3085d6'
          });
          break;

        default:
          console.error('Error no tipificado:', error);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de Red o Seguridad',
        text: 'El servidor bloqueó la conexión o no está disponible.'
      });
    }
    
    // Retornamos el rechazo de forma estándar para que el componente decida si necesita reaccionar
    return Promise.reject(error);
  }
);

export default api;