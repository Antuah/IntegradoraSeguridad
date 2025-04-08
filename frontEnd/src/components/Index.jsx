import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paquetesApi } from '../services/api';
import '../styles/Index.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt } from 'react-icons/fa';

function Index() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);

  useEffect(() => {
    loadPaquetes();
  }, []);

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      console.error('Error loading paquetes:', error);
    }
  };

  const handleVerCanales = () => {
    navigate('/canales');
  };

  return (
    <div className="index-container">
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button className="active" onClick={() => navigate('/')}>
            <AiFillHome /> Inicio
          </button>
          <button onClick={() => navigate('/categorias')}>
            <BiCategory /> Categorías
          </button>
          <button onClick={() => navigate('/canales')}>
            <MdTv /> Canales
          </button>
          <button onClick={() => navigate('/paquetes')}>
            <FaBox /> Paquetes
          </button>
          <button onClick={() => navigate('/clientes')}>
            <FaUsers /> Clientes
          </button>
          <button onClick={() => navigate('/contratos')}>
            <FaFileContract /> Contratos
          </button>
          <button onClick={() => navigate('/login')}>
            <FaSignInAlt /> Iniciar Sesión
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className="dashboard-header">
          <h1>Paquetes de Internet + TV</h1>
          <p>Elige el plan perfecto para tus necesidades</p>
        </section>

        <section className="packages-grid">
          {paquetes.map((paquete) => (
            <div key={paquete.id} className="package-card">
              <div className="package-header">
                <h3>{paquete.nombre}</h3>
                <div className="package-price">${paquete.precio}<span>/mes</span></div>
              </div>
              <div className="package-speed">
                <span className="speed-value">{paquete.velocidad_internet}</span>
                <span className="speed-label">Velocidad de Internet</span>
              </div>
              <div className="package-channels">
                <span className="channels-value">{paquete.canales.length}+ Canales</span>
                <span className="channels-label">Televisión Digital</span>
                <div className="channels-list">
                  {paquete.canales.map((canal) => (
                    <span key={canal.id} className="channel-tag">
                      {canal.nombre}
                    </span>
                  ))}
                </div>
              </div>
              <div className="package-features">
                <p>{paquete.descripcion}</p>
                <p>Telefonía: {paquete.incluye_telefonia ? 'Incluida' : 'No incluida'}</p>
              </div>
              <button className="subscribe-button">Contratar Ahora</button>
            </div>
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Index;
