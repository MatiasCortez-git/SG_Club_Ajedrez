import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalAlumno from './components/PortalAlumno';
import VistaAlumnos from './components/VistaAlumnos';
import VistaTalleres from './components/VistaTalleres';
import VistaCaja from './components/VistaCaja';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PortalAlumno />} />
        <Route path="/alumnos" element={<VistaAlumnos />} />
        <Route path="/talleres" element={<VistaTalleres />} />
        <Route path="/caja" element={<VistaCaja />} />
      </Routes>
    </Router>
  );
}

export default App;