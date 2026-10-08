import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalAlumno from './components/PortalAlumno';
import VistaAlumnos from './components/VistaAlumnos';
import VistaTalleres from './components/VistaTalleres';
import VistaCaja from './components/VistaCaja';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VistaProfesores from './components/VistaProfesores';
import VistaReportes from './components/VistaReportes';
import VistaInscripciones from './components/VistaInscripciones';
import PanelAdmin from './components/PanelAdmin';
import VistaPrimerIngreso from './components/VistaPrimerIngreso';
import VistaPerfil from './components/VistaPerfil';
import VistaOlvidePassword from './components/VistaOlvidePassword';
import VistaResetPassword from './components/VistaResetPassword';

// El Guardián de Rutas Privadas
const PrivateRoute = ({ children }) => {
  const isLogged = sessionStorage.getItem('isLogged') === 'true';
  const debeCambiar = sessionStorage.getItem('debe_cambiar_password') === 'true';

  // Si está en cuarentena por primer ingreso, lo encerramos en /primer-ingreso
  if (debeCambiar) {
    return <Navigate to="/primer-ingreso" replace />;
  }

  return isLogged ? children : <Navigate to="/login" replace />;
};

// Guardián exclusivo para la pantalla de Cuarentena (/primer-ingreso)
const PrimerIngresoRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const debeCambiar = sessionStorage.getItem('debe_cambiar_password') === 'true';

  if (!token) return <Navigate to="/login" replace />;
  if (!debeCambiar) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PortalAlumno />} />
        <Route path="/login" element={<Login />} />
        <Route path="/olvide-password" element={<VistaOlvidePassword />} />
        <Route path="/reset-password" element={<VistaResetPassword />} />
        
        {/* Ruta de Cuarentena (Sin Navbar) */}
        <Route path="/primer-ingreso" element={<PrimerIngresoRoute><VistaPrimerIngreso /></PrimerIngresoRoute>} />

        {/* Rutas Protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/mi-perfil" element={<PrivateRoute><VistaPerfil /></PrivateRoute>} />
        <Route path="/alumnos" element={<PrivateRoute><VistaAlumnos /></PrivateRoute>} />
        <Route path="/talleres" element={<PrivateRoute><VistaTalleres /></PrivateRoute>} />
        <Route path="/caja" element={<PrivateRoute><VistaCaja /></PrivateRoute>} />
        <Route path="/profesores" element={<PrivateRoute><VistaProfesores /></PrivateRoute>} />
        <Route path="/reportes" element={<PrivateRoute><VistaReportes /></PrivateRoute>} />
        <Route path="/inscripciones" element={<PrivateRoute><VistaInscripciones /></PrivateRoute>} />
        <Route path="/panel-admin" element={<PrivateRoute><PanelAdmin /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;