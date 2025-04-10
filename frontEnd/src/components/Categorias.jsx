import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canalesApi } from '../services/api';
import '../styles/Categorias.css';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';

function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [currentCategoria, setCurrentCategoria] = useState({
    nombre: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({
    nombre: ''
  });

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

  // Add validation function
  const validateForm = () => {
    let isValid = true;
    const errors = {
      nombre: ''
    };

    if (!currentCategoria.nombre.trim()) {
      errors.nombre = 'El nombre de la categoría no puede estar vacío';
      isValid = false;
    } else if (currentCategoria.nombre.length > 35) {
      errors.nombre = 'El nombre no puede exceder los 35 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Modify handleSubmit to include validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
                  onChange={(e) => {
                    setCurrentCategoria({ ...currentCategoria, nombre: e.target.value });
                    if (formErrors.nombre) {
                      validateForm();
                    }
                  }}
                  placeholder="Ingrese el nombre de la categoría"
                  required
                  className={formErrors.nombre ? 'error-input' : ''}
                />
                {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
              </div>
              <div className="form-buttons">
                <button 
                  type="submit"
                  className="primary-button"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
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
     
    </div>
  );
}

export default Categorias;