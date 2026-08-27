import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalAlumno from './components/PortalAlumno';
import VistaAlumnos from './components/VistaAlumnos';
import VistaTalleres from './components/VistaTalleres';
import VistaCaja from './components/VistaCaja';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VistaProfesores from './components/VistaProfesores';

// El Guardián
const PrivateRoute = ({ children }) => {
  const isLogged = localStorage.getItem('isLogged') === 'true';
  return isLogged ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PortalAlumno />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/alumnos" element={<PrivateRoute><VistaAlumnos /></PrivateRoute>} />
        <Route path="/talleres" element={<PrivateRoute><VistaTalleres /></PrivateRoute>} />
        <Route path="/caja" element={<PrivateRoute><VistaCaja /></PrivateRoute>} />
        <Route path="/profesores" element={<PrivateRoute><VistaProfesores /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;