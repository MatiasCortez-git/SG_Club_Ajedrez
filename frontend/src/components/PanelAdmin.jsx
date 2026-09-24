import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import ModalCrearUsuario from './ModalCrearUsuario';

const PanelAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [archivoBackup, setArchivoBackup] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      // Amortiguador silencioso
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleBajaUsuario = async (idUsuario, username) => {
    const result = await Swal.fire({
      title: '¿Desactivar credencial?',
      text: `El usuario ${username} perderá el acceso al sistema. Su historial de cobros se mantendrá intacto.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/usuarios/${idUsuario}`);
        Swal.fire('Operación completada', 'La credencial fue dada de baja lógicamente.', 'success');
        fetchUsuarios();
      } catch (error) {
        // Amortiguador silencioso
      }
    }
  };

  const handleDescargarBackup = async () => {
    try {
      Swal.fire({ title: 'Generando respaldo...', allowOutsideClick: false });
      Swal.showLoading();
      
      const res = await api.get('/admin/backup', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_ajedrez_${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      
      Swal.close();
    } catch (error) {
      // Amortiguador silencioso
    }
  };

  const handleRestaurarBackup = async () => {
    if (!archivoBackup) return;

    const result = await Swal.fire({
      title: '¿Estás completamente seguro?',
      text: "Esto destruirá los datos actuales y los reemplazará por los del archivo. Esta acción es irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, sobrescribir'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Restaurando base de datos...', text: 'No cierres esta ventana', allowOutsideClick: false });
        Swal.showLoading();

        const formData = new FormData();
        formData.append('file', archivoBackup); 

        await api.post('/admin/restore', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        Swal.fire('Operación completada', 'La base de datos fue restaurada.', 'success');
        setArchivoBackup(null); 
        fetchUsuarios(); 
      } catch (error) {
        // Amortiguador silencioso
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Panel de Control - Administrador</h2>

      {/* SECCIÓN 1: GESTIÓN DE RESPALDOS (BACKUP) */}
      <div className="card shadow-sm mb-4 border-info">
        <div className="card-header bg-info text-white fw-bold d-flex align-items-center">
          Respaldo y Restauración de Base de Datos
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6 text-center border-end">
              <h6 className="text-muted mb-3">Exportar datos actuales</h6>
              <button className="btn btn-outline-primary w-75 d-flex justify-content-center align-items-center mx-auto" onClick={handleDescargarBackup}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Descargar Archivo SQL
              </button>
            </div>
            <div className="col-md-6 text-center">
              <h6 className="text-muted mb-3">Restaurar desde archivo</h6>
              <div className="p-3 border border-2 border-dashed rounded bg-light" style={{ borderStyle: 'dashed' }}>
                <input type="file" className="form-control mb-2" accept=".sql" onChange={(e) => setArchivoBackup(e.target.files[0])} />
                <button className="btn btn-danger w-75 d-flex justify-content-center align-items-center mx-auto" onClick={handleRestaurarBackup} disabled={!archivoBackup}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  Sobrescribir Base de Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DATATABLE DE USUARIOS */}
      <div className="card shadow-sm border-secondary">
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <span className="fw-bold d-flex align-items-center">
            Gestión de Accesos al Sistema
          </span>
          <button className="btn btn-sm btn-light text-primary fw-bold" onClick={() => setShowModal(true)}>
            + Nuevo Usuario
          </button>
        </div>
        <div className="card-body p-0 table-responsive">
          <table className="table table-striped table-hover mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Identidad</th>
                <th>Email / Username</th>
                <th>Rol de Seguridad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan="5" className="py-4 text-muted">No hay usuarios registrados</td></tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.idUsuario} className={!u.isActive ? 'text-muted' : ''}>
                    <td className="fw-bold">{u.idUsuario}</td>
                    <td>{u.nombreCompleto || 'Cargando...'}</td>
                    <td>{u.username}</td>
                    <td>
                      <span className={`badge ${u.rol === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                        {u.rol.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleBajaUsuario(u.idUsuario, u.username)}
                        disabled={u.isActive === false || u.rol === 'ROLE_ADMIN'}
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE ALTA DE USUARIO */}
      <ModalCrearUsuario 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        refreshUsuarios={fetchUsuarios} 
      />
    </div>
  );
};

export default PanelAdmin;