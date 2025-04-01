import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <h1>404</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <button className="back-button" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
}

export default NotFound;