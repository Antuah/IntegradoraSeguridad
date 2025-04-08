import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paquetesApi, canalesApi } from '../services/api';
import '../styles/Paquetes.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt } from 'react-icons/fa';

function Paquetes() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);
  const [canales, setCanales] = useState([]);
  const [currentPaquete, setCurrentPaquete] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    velocidad_internet: '',
    incluye_telefonia: false,
    canales: [],
    imagen_url: '' // Add this line
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPaquetes();
    loadCanales();
  }, []);

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      setCanales(response.data);
    } catch (error) {
      console.error('Error loading canales:', error);
    }
  };

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      console.log('Paquetes response:', response.data);
      setPaquetes(response.data);
    } catch (error) {
      console.error('Error loading paquetes:', error);
    }
  };

  const handleCanalChange = (canalId) => {
    const updatedCanales = currentPaquete.canales.includes(canalId)
      ? currentPaquete.canales.filter(id => id !== canalId)
      : [...currentPaquete.canales, canalId];

    setCurrentPaquete({
      ...currentPaquete,
      canales: updatedCanales
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: currentPaquete.nombre,
        descripcion: currentPaquete.descripcion,
        precio: parseFloat(currentPaquete.precio),
        velocidad_internet: currentPaquete.velocidad_internet,
        incluye_telefonia: currentPaquete.incluye_telefonia,
        canales_ids: currentPaquete.canales,
        imagen_url: currentPaquete.imagen_url
      };

      if (isEditing) {
        await paquetesApi.updatePaquete(currentPaquete.id, formData);
      } else {
        await paquetesApi.createPaquete(formData);
      }
      setCurrentPaquete({
        nombre: '',
        descripcion: '',
        precio: '',
        velocidad_internet: '',
        incluye_telefonia: false,
        canales: [],
        imagen_url: '' // Add this line
      });
      setIsEditing(false);
      await loadPaquetes();
    } catch (error) {
      console.error('Error saving paquete:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este paquete?')) {
      try {
        await paquetesApi.deletePaquete(id);
        await loadPaquetes();
      } catch (error) {
        console.error('Error deleting paquete:', error);
      }
    }
  };

  // Add this function after handleDelete
  const handleEdit = (paquete) => {
    setCurrentPaquete({
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio,
      velocidad_internet: paquete.velocidad_internet,
      incluye_telefonia: paquete.incluye_telefonia,
      canales: paquete.canales.map(canal => canal.id),
      imagen_url: paquete.imagen_url
    });
    setIsEditing(true);
  };

  return (
    <div className="paquetes-container">
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>
            <AiFillHome /> Inicio
          </button>
          <button onClick={() => navigate('/categorias')}>
            <BiCategory /> Categorías
          </button>
          <button onClick={() => navigate('/canales')}>
            <MdTv /> Canales
          </button>
          <button className="active" onClick={() => navigate('/paquetes')}>
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
        <h2>{isEditing ? 'Editar Paquete' : 'Nuevo Paquete'}</h2>
        <div className="header-with-nav">
          <button className="back-button" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
          <h2>{isEditing ? 'Editar Paquete' : 'Nuevo Paquete'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              value={currentPaquete.nombre}
              onChange={(e) => setCurrentPaquete({ ...currentPaquete, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Descripción:</label>
            <textarea
              value={currentPaquete.descripcion}
              onChange={(e) => setCurrentPaquete({ ...currentPaquete, descripcion: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Velocidad de Internet:</label>
            <input
              type="text"
              value={currentPaquete.velocidad_internet}
              onChange={(e) => setCurrentPaquete({ ...currentPaquete, velocidad_internet: e.target.value })}
              placeholder="Ej: 100 Mbps"
              required
            />
          </div>

          {/* Add the image URL field here */}
          <div>
            <label>URL de la imagen:</label>
            <input
              type="url"
              value={currentPaquete.imagen_url}
              onChange={(e) => setCurrentPaquete({ ...currentPaquete, imagen_url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={currentPaquete.incluye_telefonia}
                onChange={(e) => setCurrentPaquete({ ...currentPaquete, incluye_telefonia: e.target.checked })}
              />
              Incluye Telefonía
            </label>
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="number"
              step="0.01"
              value={currentPaquete.precio}
              onChange={(e) => setCurrentPaquete({ ...currentPaquete, precio: e.target.value })}
              required
            />
          </div>
          <div className="canales-selection">
            <label>Canales:</label>
            <div className="canales-grid">
              {canales.map(canal => (
                <div key={canal.id} className="canal-checkbox">
                  <input
                    type="checkbox"
                    id={`canal-${canal.id}`}
                    checked={currentPaquete.canales.includes(canal.id)}
                    onChange={() => handleCanalChange(canal.id)}
                  />
                  <label htmlFor={`canal-${canal.id}`}>{canal.nombre}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</button>
            {isEditing && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setCurrentPaquete({
                    nombre: '',
                    descripcion: '',
                    precio: '',
                    velocidad_internet: '',
                    incluye_telefonia: false,
                    canales: [],
                    imagen_url: ''
                  });
                  setIsEditing(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <h2>Lista de Paquetes</h2>
        <div className="paquetes-list">
          {paquetes.map(paquete => (
            <div key={paquete.id} className="paquete-card">
              {paquete.imagen_url && (
                <img
                  src={paquete.imagen_url}
                  alt={paquete.nombre}
                  className="paquete-imagen"
                />
              )}
              <h3>{paquete.nombre}</h3>
              <p>{paquete.descripcion}</p>
              <p>Velocidad: {paquete.velocidad_internet}</p>
              <p>Telefonía: {paquete.incluye_telefonia ? 'Incluida' : 'No incluida'}</p>
              <p>Precio: ${paquete.precio}</p>
              <div className="card-buttons">
                <button onClick={() => handleEdit(paquete)}>Editar</button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(paquete.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Paquetes;