import { useState, useEffect } from 'react';
import { canalesApi } from '../services/api';
import '../styles/Canales.css';
import Swal from 'sweetalert2';

function Canales() {
  const [canales, setCanales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [currentCanal, setCurrentCanal] = useState({
    nombre: '',
    categoria: '',
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({
    nombre: ''
  });

  useEffect(() => {
    loadCanales();
    loadCategorias();
  }, []);

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      setCanales(response.data);
    } catch (error) {
      void error;
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      void error;
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      nombre: ''
    };

    if (currentCanal.nombre.length > 30) {
      errors.nombre = 'El nombre no puede exceder los 30 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!validateForm()) {
      return;
    }
  
    try {
      const formData = {
        nombre: currentCanal.nombre,
        categoria: currentCanal.categoria,
        imagen_url: currentCanal.imagen_url
      };
  
      if (isEditing) {
        await canalesApi.updateCanal(currentCanal.id, formData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El canal ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      } else {
        await canalesApi.createCanal(formData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El canal ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      }
      setCurrentCanal({
        nombre: '',
        categoria: '',
        imagen_url: ''
      });
      setIsEditing(false);
      await loadCanales();
    } catch (error) {
      void error;
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar el canal',
        icon: 'error',
        confirmButtonColor: '#CCEAF4',
      });
    }
  };
  
  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CCEAF4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await canalesApi.deleteCanal(id);
          await loadCanales();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El canal ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#CCEAF4',
          });
        } catch (error) {
          void error;
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el canal',
            icon: 'error',
            confirmButtonColor: '#CCEAF4',
          });
        }
      }
    });
  };

  const handleEdit = (canal) => {
    setCurrentCanal(canal);
    setIsEditing(true);
  };

  return (
    <div className="canales-container">
      
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
                    onChange={(e) => {
                      setCurrentCanal({ ...currentCanal, nombre: e.target.value });
                      if (formErrors.nombre) {
                        validateForm();
                      }
                    }}
                    placeholder="Ingrese el nombre del canal"
                    required
                    className={formErrors.nombre ? 'error-input' : ''}
                  />
                  {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
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
      
    </div>
  );
}

export default Canales;