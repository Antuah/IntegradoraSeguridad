import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';
import '../styles/Clientes.css';

function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [currentCliente, setCurrentCliente] = useState({
    nombre: '',
    direccion: '',
    rfc: '',
    telefono: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getClientes();
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
      navigate('/500');
    }
  };

  // Add after the existing state declarations
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    direccion: '',
    rfc: '',
    telefono: ''
  });
  
  // Add validation function before handleSubmit
  const validateForm = () => {
    let isValid = true;
    const errors = {
      nombre: '',
      direccion: '',
      rfc: '',
      telefono: ''
    };
  
    // Validate nombre
    if (!currentCliente.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (currentCliente.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder los 100 caracteres';
      isValid = false;
    }
  
    // Validate RFC
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!currentCliente.rfc.trim()) {
      errors.rfc = 'El RFC es requerido';
      isValid = false;
    } else if (!rfcRegex.test(currentCliente.rfc.trim())) {
      errors.rfc = 'Ingrese un RFC válido (Formato: AAAA123456ABC)';
      isValid = false;
    }
  
    // Validate telefono
    const phoneRegex = /^\d{10}$/;
    if (!currentCliente.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
      isValid = false;
    } else if (!phoneRegex.test(currentCliente.telefono.trim())) {
      errors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
      isValid = false;
    }
  
    // Validate direccion
    if (!currentCliente.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
      isValid = false;
    } else if (currentCliente.direccion.length > 200) {
      errors.direccion = 'La dirección no puede exceder los 200 caracteres';
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
      const clienteData = {
        nombre: currentCliente.nombre.trim(),
        direccion: currentCliente.direccion.trim(),
        rfc: currentCliente.rfc.trim().toUpperCase(),
        telefono: parseInt(currentCliente.telefono.replace(/\D/g, ''))
      };
  
      // Validate RFC format (Mexican RFC format)
      const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(clienteData.rfc)) {
        alert('Por favor, ingrese un RFC válido');
        return;
      }
  
      // Validate phone number (only numbers)
      if (isNaN(clienteData.telefono)) {
        alert('Por favor, ingrese un número de teléfono válido (solo números)');
        return;
      }
  
      if (isEditing) {
        await clientesApi.updateCliente(currentCliente.id, clienteData);
      } else {
        await clientesApi.createCliente(clienteData);
      }
  
      setCurrentCliente({
        nombre: '',
        direccion: '',
        rfc: '',
        telefono: ''
      });
      setIsEditing(false);
      await loadClientes();
    } catch (error) {
      console.error('Error saving cliente:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
          'Error al guardar el cliente. Por favor, verifique los datos.';
        alert(errorMessage);
      } else {
        navigate('/500');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesApi.deleteCliente(id);
        await loadClientes();
      } catch (error) {
        console.error('Error deleting cliente:', error);
        navigate('/500');
      }
    }
  };

  const handleEdit = (cliente) => {
    setCurrentCliente(cliente);
    setIsEditing(true);
  };

  return (
    <div className="clientes-container">
      <main className="main-content">
        <div className="content-wrapper">
          <div className="form-section">
            <div className="form-container">
              <h2 className="form-title">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <form onSubmit={handleSubmit} className="cliente-form">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={currentCliente.nombre}
                    onChange={(e) => {
                      setCurrentCliente({ ...currentCliente, nombre: e.target.value });
                      if (formErrors.nombre) validateForm();
                    }}
                    className={formErrors.nombre ? 'error-input' : ''}
                    required
                    maxLength={100}
                    placeholder="Ingrese el nombre completo del cliente"
                  />
                  {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
                </div>
                <div className="form-group">
                  <label>RFC:</label>
                  <input
                    type="text"
                    value={currentCliente.rfc}
                    onChange={(e) => {
                      setCurrentCliente({ ...currentCliente, rfc: e.target.value.toUpperCase() });
                      if (formErrors.rfc) validateForm();
                    }}
                    className={formErrors.rfc ? 'error-input' : ''}
                    required
                    maxLength={13}
                    placeholder="Formato: AAAA123456ABC"
                  />
                  {formErrors.rfc && <span className="error-message">{formErrors.rfc}</span>}
                </div>
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={currentCliente.telefono}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCurrentCliente({ ...currentCliente, telefono: value });
                      if (formErrors.telefono) validateForm();
                    }}
                    className={formErrors.telefono ? 'error-input' : ''}
                    required
                    maxLength={10}
                    placeholder="Ingrese 10 dígitos sin espacios ni guiones"
                  />
                  {formErrors.telefono && <span className="error-message">{formErrors.telefono}</span>}
                </div>
                <div className="form-group">
                  <label>Dirección:</label>
                  <textarea
                    value={currentCliente.direccion}
                    onChange={(e) => {
                      setCurrentCliente({ ...currentCliente, direccion: e.target.value });
                      if (formErrors.direccion) validateForm();
                    }}
                    className={formErrors.direccion ? 'error-input' : ''}
                    required
                    maxLength={200}
                    placeholder="Ingrese la dirección completa del cliente"
                  />
                  {formErrors.direccion && <span className="error-message">{formErrors.direccion}</span>}
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
                        setCurrentCliente({
                          nombre: '',
                          direccion: '',
                          rfc: '',
                          telefono: ''
                        });
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
            <h2 className="section-title">Lista de Clientes</h2>
            <div className="clientes-list-container">
              <ul className="clientes-list-view">
                {clientes.length > 0 ? (
                  clientes.map(cliente => (
                    <li key={cliente.id} className="cliente-list-item">
                      <div className="cliente-info">
                        <span className="cliente-name">{cliente.nombre}</span>
                        <span className="cliente-details">RFC: {cliente.rfc}</span>
                        <span className="cliente-details">Tel: {cliente.telefono}</span>
                        <span className="cliente-details">Dir: {cliente.direccion}</span>
                      </div>
                      <div className="action-icons">
                        <button 
                          className="icon-button edit-icon"
                          onClick={() => handleEdit(cliente)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="icon-button delete-icon"
                          onClick={() => handleDelete(cliente.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-results">No hay clientes disponibles</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
);
}

export default Clientes;