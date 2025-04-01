import { useNavigate } from 'react-router-dom';
import '../styles/ServerError.css';

function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="logo">SIGIPT</div>
      <h1>500</h1>
      <p>Lo sentimos, ha ocurrido un error en el servidor.</p>
      <p className="error-details">Por favor, inténtalo de nuevo más tarde.</p>
      <button className="back-button" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
}

export default ServerError;