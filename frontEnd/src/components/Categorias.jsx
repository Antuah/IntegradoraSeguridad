import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canalesApi } from '../services/api';
import '../styles/Categorias.css';
import { AiFillHome, AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt, FaSearch } from 'react-icons/fa';

function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [currentCategoria, setCurrentCategoria] = useState({
    nombre: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      console.log('Categorias response:', response.data);
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await canalesApi.updateCategoria(currentCategoria.id, currentCategoria);
      } else {
        await canalesApi.createCategoria(currentCategoria);
      }
      setCurrentCategoria({ nombre: '' });
      setIsEditing(false);
      await loadCategorias();
    } catch (error) {
      console.error('Error saving categoria:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
      try {
        await canalesApi.deleteCategoria(id);
        await loadCategorias();
      } catch (error) {
        console.error('Error deleting categoria:', error);
      }
    }
  };

  const handleEdit = (categoria) => {
    setCurrentCategoria(categoria);
    setIsEditing(true);
  };

  // Filter categories based on search term
  const filteredCategorias = categorias.filter(categoria => 
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="categorias-container">
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>
            <AiFillHome /> Inicio
          </button>
          <button className="active" onClick={() => navigate('/categorias')}>
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
        <div className="form-and-list-container">
          <div className="form-container">
            <h2 className="form-title">{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSubmit} className="categoria-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input
                  id="nombre"
                  type="text"
                  value={currentCategoria.nombre}
                  onChange={(e) => setCurrentCategoria({ ...currentCategoria, nombre: e.target.value })}
                  placeholder="Ingrese el nombre de la categoría"
                  required
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
                      setCurrentCategoria({ nombre: '' });
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="categorias-section">
            <h2 className="section-title">Lista de Categorías</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ul className="categorias-list-view">
              {filteredCategorias.map(categoria => (
                <li key={categoria.id} className="categoria-list-item">
                  <span className="categoria-name">{categoria.nombre}</span>
                  <div className="action-icons">
                    <button 
                      onClick={() => handleEdit(categoria)} 
                      className="icon-button edit-icon"
                      title="Editar categoría"
                    >
                      <AiFillEdit />
                    </button>
                    <button
                      className="icon-button delete-icon"
                      onClick={() => handleDelete(categoria.id)}
                      title="Eliminar categoría"
                    >
                      <AiFillDelete />
                    </button>
                  </div>
                </li>
              ))}
              {filteredCategorias.length === 0 && (
                <li className="no-results">
                  <p>No se encontraron categorías que coincidan con la búsqueda.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Categorias;