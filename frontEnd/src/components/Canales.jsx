import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canalesApi } from '../services/api';
import '../styles/Canales.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt } from 'react-icons/fa';


function Canales() {
  const navigate = useNavigate();
  const [canales, setCanales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [currentCanal, setCurrentCanal] = useState({
    nombre: '',
    categoria: '',
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCanales();
    loadCategorias();
  }, []);

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      console.log('Canales response:', response.data); // For debugging
      setCanales(response.data);
    } catch (error) {
      console.error('Error loading canales:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      console.log('Categorias response:', response.data); // For debugging
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: currentCanal.nombre,
        categoria: currentCanal.categoria,
        imagen_url: currentCanal.imagen_url
      };

      if (isEditing) {
        await canalesApi.updateCanal(currentCanal.id, formData);
      } else {
        await canalesApi.createCanal(formData);
      }
      setCurrentCanal({
        nombre: '',
        categoria: '',
        imagen_url: ''
      });
      setIsEditing(false);
      await loadCanales();
    } catch (error) {
      console.error('Error saving canal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este canal?')) {
      try {
        await canalesApi.deleteCanal(id);
        loadCanales();
      } catch (error) {
        console.error('Error deleting canal:', error);
      }
    }
  };

  const handleEdit = (canal) => {
    setCurrentCanal(canal);
    setIsEditing(true);
  };

  return (
    <div className="canales-container">
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>
            <AiFillHome /> Inicio
          </button>
          <button onClick={() => navigate('/categorias')}>
            <BiCategory /> Categorías
          </button>
          <button className="active" onClick={() => navigate('/canales')}>
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
       
        
        <div className="content-wrapper">
          <div className="form-section">
            <div className="form-container">
              <h2 className="form-title">{isEditing ? 'Editar Canal' : 'Nuevo Canal'}</h2>
              <form onSubmit={handleSubmit} className="canal-form">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    id="nombre"
                    type="text"
                    value={currentCanal.nombre}
                    onChange={(e) => setCurrentCanal({ ...currentCanal, nombre: e.target.value })}
                    placeholder="Ingrese el nombre del canal"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="categoria">Categoría:</label>
                  <select
                    id="categoria"
                    value={currentCanal.categoria}
                    onChange={(e) => setCurrentCanal({ ...currentCanal, categoria: e.target.value })}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="imagen_url">URL de la imagen:</label>
                  <input
                    id="imagen_url"
                    type="text"
                    value={currentCanal.imagen_url}
                    onChange={(e) => setCurrentCanal({ ...currentCanal, imagen_url: e.target.value })}
                    placeholder="Ingrese la URL de la imagen"
                  />
                </div>
                
                <div className="form-buttons">
                  
                  <button 
                    type="submit"
                    className="primary-button"
                    style={{ backgroundColor: "#CCEAF4", color: "#000000", fontWeight: "bold" }}
                  >
                    Crear
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setCurrentCanal({ nombre: '', categoria: '', imagen_url: '' });
                        setIsEditing(false);
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="list-section">
            <h2 className="section-title">Lista de Canales</h2>
            <div className="canales-list-container">
              <ul className="canales-list-view">
                {canales.length > 0 ? (
                  canales.map(canal => (
                    <li key={canal.id} className="canal-list-item">
                      <div className="canal-info">
                        <span className="canal-name">{canal.nombre}</span>
                        <span className="canal-category">
                          {categorias.find(cat => cat.id === canal.categoria)?.nombre || 'Sin categoría'}
                        </span>
                      </div>
                      <div className="action-icons">
                        <button 
                          className="icon-button edit-icon" 
                          onClick={() => handleEdit(canal)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="icon-button delete-icon" 
                          onClick={() => handleDelete(canal.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-results">No hay canales disponibles</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Canales;