import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';
import '../styles/Clientes.css';
import Swal from 'sweetalert2';

function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [currentCliente, setCurrentCliente] = useState({
    nombre: '',
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
      void error;
      navigate('/500');
    }
  };

  const [formErrors, setFormErrors] = useState({
    nombre: '',
    rfc: '',
    telefono: ''
  });
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      nombre: '',
      rfc: '',
      telefono: ''
    };
  
    if (!currentCliente.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (currentCliente.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder los 100 caracteres';
      isValid = false;
    }
  
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!currentCliente.rfc.trim()) {
      errors.rfc = 'El RFC es requerido';
      isValid = false;
    } else if (!rfcRegex.test(currentCliente.rfc.trim())) {
      errors.rfc = 'Ingrese un RFC válido (Formato: AAAA123456ABC)';
      isValid = false;
    }
  
    const phoneRegex = /^\d{10}$/;
    if (!currentCliente.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
      isValid = false;
    } else if (!phoneRegex.test(currentCliente.telefono.trim())) {
      errors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
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
      const clienteData = {
        nombre: currentCliente.nombre.trim(),
        rfc: currentCliente.rfc.trim().toUpperCase(),
        telefono: parseInt(currentCliente.telefono.replace(/\D/g, ''))
      };
  
      if (isEditing) {
        await clientesApi.updateCliente(currentCliente.id, clienteData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El cliente ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      } else {
        await clientesApi.createCliente(clienteData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El cliente ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      }
  
      setCurrentCliente({
        nombre: '',
        rfc: '',
        telefono: ''
      });
      setIsEditing(false);
      await loadClientes();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.detail || 'Error al guardar el cliente. Por favor, verifique los datos.',
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
          await clientesApi.deleteCliente(id);
          await loadClientes();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El cliente ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#CCEAF4',
          });
        } catch (error) {
          void error;
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el cliente',
            icon: 'error',
            confirmButtonColor: '#CCEAF4',
          });
        }
      }
    });
  };

  const handleEdit = (cliente) => {
    setCurrentCliente(cliente);
    setIsEditing(true);
  };

  return (
    <div className="clientes-container">
     
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
     
    </div>
);
}

export default Clientes;