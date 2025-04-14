import { useState, useEffect } from 'react';
import { paquetesApi, canalesApi } from '../services/api';
import '../styles/Paquetes.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

function Paquetes() {
  const [paquetes, setPaquetes] = useState([]);
  const [canales, setCanales] = useState([]);
  const [currentPaquete, setCurrentPaquete] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    velocidad_internet: '',
    incluye_telefonia: false,
    canales: [],
    imagen_url: ''
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
      void error;
    }
  };

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      void error;
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

  const [formErrors, setFormErrors] = useState({
    nombre: '',
    descripcion: '',
    velocidad_internet: '',
    canales: ''
  });
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      nombre: '',
      descripcion: '',
      velocidad_internet: '',
      canales: ''
    };
  
    if (!currentPaquete.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (currentPaquete.nombre.length > 35) {
      errors.nombre = 'El nombre no puede exceder los 35 caracteres';
      isValid = false;
    }
  
    if (!currentPaquete.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
      isValid = false;
    } else if (currentPaquete.descripcion.length > 200) {
      errors.descripcion = 'La descripción no puede exceder los 200 caracteres';
      isValid = false;
    }
  
    if (!currentPaquete.velocidad_internet) {
      errors.velocidad_internet = 'La velocidad es requerida';
      isValid = false;
    } else if (!/^\d+$/.test(currentPaquete.velocidad_internet)) {
      errors.velocidad_internet = 'Solo se permiten números';
      isValid = false;
    } else if (currentPaquete.velocidad_internet.length > 5) {
      errors.velocidad_internet = 'No puede exceder 5 dígitos';
      isValid = false;
    }
  
    if (currentPaquete.canales.length === 0) {
      errors.canales = 'Debe seleccionar al menos un canal';
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
        Swal.fire({
          title: '¡Éxito!',
          text: 'El paquete ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      } else {
        await paquetesApi.createPaquete(formData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El paquete ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      }
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
      await loadPaquetes();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.detail || 'Error al guardar el paquete. Por favor, verifique los datos.',
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
          await paquetesApi.deletePaquete(id);
          await loadPaquetes();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El paquete ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#CCEAF4',
          });
        } catch (error) {
          void error;
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el paquete',
            icon: 'error',
            confirmButtonColor: '#CCEAF4',
          });
        }
      }
    });
  };

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
   
        <div className="paquetes-layout">
          <form onSubmit={handleSubmit} className="paquete-form">
            <h2 className="form-title">{isEditing ? 'Editar Paquete' : 'Nuevo Paquete'}</h2>
            
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={currentPaquete.nombre}
                onChange={(e) => {
                  setCurrentPaquete({ ...currentPaquete, nombre: e.target.value });
                  if (formErrors.nombre) validateForm();
                }}
                className={formErrors.nombre ? 'error-input' : ''}
                required
              />
              {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={currentPaquete.descripcion}
                onChange={(e) => {
                  setCurrentPaquete({ ...currentPaquete, descripcion: e.target.value });
                  if (formErrors.descripcion) validateForm();
                }}
                className={formErrors.descripcion ? 'error-input' : ''}
                required
              />
              {formErrors.descripcion && <span className="error-message">{formErrors.descripcion}</span>}
            </div>

            <div className="form-group">
              <label>Velocidad de Internet:</label>
              <input
                type="number"
                value={currentPaquete.velocidad_internet}
                onChange={(e) => {
                  setCurrentPaquete({ ...currentPaquete, velocidad_internet: e.target.value });
                  if (formErrors.velocidad_internet) validateForm();
                }}
                placeholder="Ej: 100mbs"
                className={formErrors.velocidad_internet ? 'error-input' : ''}
                required
              />
              {formErrors.velocidad_internet && <span className="error-message">{formErrors.velocidad_internet}</span>}
            </div>

            <div className="canales-selection">
              <label>Canales:</label>
              <div className={`canales-grid ${formErrors.canales ? 'error-input' : ''}`}>
                {canales.map(canal => (
                  <div key={canal.id} className="canal-checkbox">
                    <input
                      type="checkbox"
                      id={`canal-${canal.id}`}
                      checked={currentPaquete.canales.includes(canal.id)}
                      onChange={() => {
                        handleCanalChange(canal.id);
                        if (formErrors.canales) validateForm();
                      }}
                    />
                    <label htmlFor={`canal-${canal.id}`}>{canal.nombre}</label>
                  </div>
                ))}
              </div>
              {formErrors.canales && <span className="error-message">{formErrors.canales}</span>}
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label>Precio:</label>
              <input
                type="number"
                step="0.01"
                value={currentPaquete.precio}
                onChange={(e) => setCurrentPaquete({ ...currentPaquete, precio: e.target.value })}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="primary-button">
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
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

          <div className="paquetes-list-container">
            <h2 className="section-title">Lista de Paquetes</h2>
            <div className="paquetes-list-vertical">
              {paquetes.map(paquete => (
                <details key={paquete.id} className="paquete-item">
                  <summary className="paquete-summary">{paquete.nombre}</summary>
                  <div className="paquete-details">
                    {paquete.imagen_url && (
                      <img
                        src={paquete.imagen_url}
                        alt={paquete.nombre}
                        className="paquete-imagen"
                      />
                    )}
                    <p>{paquete.descripcion}</p>
                    <p>Velocidad: {paquete.velocidad_internet}</p>
                    <p>Telefonía: {paquete.incluye_telefonia ? 'Incluida' : 'No incluida'}</p>
                    <p>Precio: ${paquete.precio}</p>
                    
                    <div className="card-actions">
                      <span className="action-icon edit-icon" onClick={() => handleEdit(paquete)}>
                        <FaEdit />
                      </span>
                      <span className="action-icon delete-icon" onClick={() => handleDelete(paquete.id)}>
                        <FaTrash />
                      </span>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
     
    </div>
  );
}

export default Paquetes;