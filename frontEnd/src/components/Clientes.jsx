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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
                    onChange={(e) => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
                    required
                    maxLength={255}
                  />
                </div>
                <div className="form-group">
                  <label>RFC:</label>
                  <input
                    type="text"
                    value={currentCliente.rfc}
                    onChange={(e) => setCurrentCliente({ ...currentCliente, rfc: e.target.value.toUpperCase() })}
                    required
                    maxLength={13}
                    pattern="^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$"
                    title="Ingrese un RFC válido (Formato: AAAA123456ABC)"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={currentCliente.telefono}
                    onChange={(e) => setCurrentCliente({ ...currentCliente, telefono: e.target.value })}
                    required
                    pattern="[0-9]+"
                    title="Ingrese solo números"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Dirección:</label>
                  <textarea
                    value={currentCliente.direccion}
                    onChange={(e) => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
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