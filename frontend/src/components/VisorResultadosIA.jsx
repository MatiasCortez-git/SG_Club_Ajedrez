import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';

const VisorResultadosIA = ({ aiResponse, onVolver }) => {
  if (!aiResponse) return null;

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(aiResponse.contenidoPgn);
    Swal.fire({
      icon: 'success',
      title: 'Operación completada',
      text: 'PGN copiado al portapapeles. Podés pegarlo en Lichess o ChessBase.',
      timer: 2500,
      showConfirmButton: false
    });
  };

  const descargarPgn = () => {
    const blob = new Blob([aiResponse.contenidoPgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ejercicios_clase.pgn';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card shadow-sm border-success mt-4">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Resultados del Análisis IA</h5>
        <button className="btn btn-sm btn-light text-success fw-bold d-flex align-items-center" onClick={onVolver}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Nueva Consulta
        </button>
      </div>
      <div className="card-body">
        <div className="row">
          
          <div className="col-md-7 mb-4">
            <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">Análisis Pedagógico</h6>
            <div className="p-3 bg-light rounded border">
              <ReactMarkdown>{aiResponse.informeMarkdown}</ReactMarkdown>
            </div>
          </div>

          <div className="col-md-5">
            <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">Material de Ajedrez (PGN)</h6>
            
            <div className="bg-dark text-light p-3 rounded mb-3 overflow-auto shadow-sm" style={{ maxHeight: '400px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {aiResponse.contenidoPgn}
              </pre>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary w-100 fw-bold d-flex align-items-center justify-content-center" onClick={copiarAlPortapapeles}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copiar PGN
              </button>
              <button className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center" onClick={descargarPgn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Descargar Archivo
              </button>
            </div>
            
            <p className="text-muted small mt-3 text-center">
              Podés importar este PGN en tu software de ajedrez preferido para ver los tableros interactivos.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisorResultadosIA;