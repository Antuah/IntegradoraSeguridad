import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canalesApi } from '../services/api';
import '../styles/Categorias.css';

function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [currentCategoria, setCurrentCategoria] = useState({
    nombre: ''
  });
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="categorias-container">
      <div className="header-with-nav">
        <button className="back-button" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
        <h2>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={currentCategoria.nombre}
            onChange={(e) => setCurrentCategoria({...currentCategoria, nombre: e.target.value})}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</button>
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

      <h2>Lista de Categorías</h2>
      <div className="categorias-list">
        {categorias.map(categoria => (
          <div key={categoria.id} className="categoria-card">
            <h3>{categoria.nombre}</h3>
            <div className="card-buttons">
              <button onClick={() => handleEdit(categoria)}>Editar</button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(categoria.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categorias;