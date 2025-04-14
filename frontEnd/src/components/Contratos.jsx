import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratosApi, clientesApi, paquetesApi } from '../services/api';
import '../styles/Contratos.css';
import Swal from 'sweetalert2';

function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [currentContrato, setCurrentContrato] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
    paquete: '',
    cliente: '',
    direccion: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadContratos();
    loadClientes();
    loadPaquetes();
  }, []);

  const loadContratos = async () => {
    try {
      const response = await contratosApi.getContratos();
      setContratos(response.data);
    } catch (error) {
      void error;
      navigate('/500');
    }
  };

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getClientes();
      setClientes(response.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const contratoData = {
        fecha_inicio: currentContrato.fecha_inicio,
        fecha_fin: currentContrato.fecha_fin,
        activo: currentContrato.activo,
        paquete: currentContrato.paquete,
        cliente: currentContrato.cliente,
        direccion: currentContrato.direccion 
      };
  
      if (isEditing) {
        await contratosApi.updateContrato(currentContrato.id, contratoData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El contrato ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      } else {
        await contratosApi.createContrato(contratoData);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El contrato ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: '#CCEAF4',
        });
      }
  
      setCurrentContrato({
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
        paquete: '',
        cliente: '',
        direccion: '' 
      });
      setIsEditing(false);
      await loadContratos();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.detail || 'Error al guardar el contrato. Por favor, verifique los datos.',
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
          await contratosApi.deleteContrato(id);
          await loadContratos();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El contrato ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#CCEAF4',
          });
        } catch (error) {
          void error;
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el contrato',
            icon: 'error',
            confirmButtonColor: '#CCEAF4',
          });
        }
      }
    });
  };

  const handleEdit = (contrato) => {
    setCurrentContrato({
      id: contrato.id,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
      activo: contrato.activo,
      paquete: contrato.paquete.id,
      cliente: contrato.cliente.id,
      direccion: contrato.direccion 
    });
    setIsEditing(true);
  };

  const [formErrors, setFormErrors] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    cliente: '',
    paquete: '',
    direccion: '' 
  });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      fecha_inicio: '',
      fecha_fin: '',
      cliente: '',
      paquete: '',
      direccion: '' 
    };
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(currentContrato.fecha_inicio);
  
    if (!currentContrato.fecha_inicio) {
      errors.fecha_inicio = 'La fecha de inicio es requerida';
      isValid = false;
    } else if (startDate < today) {
      errors.fecha_inicio = 'La fecha de inicio no puede ser anterior a hoy';
      isValid = false;
    }
  
    if (!currentContrato.cliente) {
      errors.cliente = 'Debe seleccionar un cliente';
      isValid = false;
    }
  
    if (!currentContrato.paquete) {
      errors.paquete = 'Debe seleccionar un paquete';
      isValid = false;
    }
  
    if (!currentContrato.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
      isValid = false;
    } else if (currentContrato.direccion.length > 200) {
      errors.direccion = 'La dirección no puede exceder los 200 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  
  const handleFechaInicioChange = (e) => {
    const startDate = new Date(e.target.value);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    setCurrentContrato({
      ...currentContrato,
      fecha_inicio: e.target.value,
      fecha_fin: endDate.toISOString().split('T')[0]
    });
    if (formErrors.fecha_inicio) validateForm();
  };
  
  return (
    <div className="contratos-container">
    
        <div className="content-wrapper">
          <div className="form-section">
            <div className="form-container">
              <h2 className="form-title">{isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
              <form onSubmit={handleSubmit} className="contrato-form">
                <div className="form-group">
                  <label>Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={currentContrato.fecha_inicio}
                    onChange={handleFechaInicioChange}
                    className={formErrors.fecha_inicio ? 'error-input' : ''}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.fecha_inicio && <span className="error-message">{formErrors.fecha_inicio}</span>}
                </div>
                
                <div className="form-group">
                  <label>Fecha de Fin:</label>
                  <input
                    type="date"
                    value={currentContrato.fecha_fin}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Cliente:</label>
                  <select
                    value={currentContrato.cliente}
                    onChange={(e) => {
                      setCurrentContrato({...currentContrato, cliente: e.target.value});
                      if (formErrors.cliente) validateForm();
                    }}
                    className={formErrors.cliente ? 'error-input' : ''}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - RFC: {cliente.rfc}
                      </option>
                    ))}
                  </select>
                  {formErrors.cliente && <span className="error-message">{formErrors.cliente}</span>}
                </div>
                
                <div className="form-group">
                  <label>Paquete:</label>
                  <select
                    value={currentContrato.paquete}
                    onChange={(e) => {
                      setCurrentContrato({...currentContrato, paquete: e.target.value});
                      if (formErrors.paquete) validateForm();
                    }}
                    className={formErrors.paquete ? 'error-input' : ''}
                    required
                  >
                    <option value="">Seleccione un paquete</option>
                    {paquetes.map(paquete => (
                      <option key={paquete.id} value={paquete.id}>
                        {paquete.nombre} - ${paquete.precio}
                      </option>
                    ))}
                  </select>
                  {formErrors.paquete && <span className="error-message">{formErrors.paquete}</span>}
                </div>
                
                <div className="form-group">
                  <label>Dirección:</label>
                  <textarea
                    value={currentContrato.direccion}
                    onChange={(e) => {
                      setCurrentContrato({ ...currentContrato, direccion: e.target.value });
                      if (formErrors.direccion) validateForm();
                    }}
                    className={formErrors.direccion ? 'error-input' : ''}
                    required
                    maxLength={200}
                    placeholder="Ingrese la dirección completa del contrato"
                  />
                  {formErrors.direccion && <span className="error-message">{formErrors.direccion}</span>}
                </div>
                
                <div className="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentContrato.activo}
                      onChange={(e) => setCurrentContrato({...currentContrato, activo: e.target.checked})}
                    />
                    Contrato Activo
                  </label>
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
                        setCurrentContrato({
                          fecha_inicio: '',
                          fecha_fin: '',
                          activo: true,
                          paquete: '',
                          cliente: '',
                          direccion: '' // Reset direccion
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
            <h2 className="section-title">Lista de Contratos</h2>
            <div className="contratos-list">
              {contratos.length > 0 ? (
                contratos.map(contrato => (
                  <div key={contrato.id} className="contrato-item">
                    <div className="contrato-header">
                      <h3 className="contrato-title">Contrato #{contrato.id.slice(0, 8)}</h3>
                      <div className="action-icons">
                        <button 
                          className="icon-button edit-icon"
                          onClick={() => handleEdit(contrato)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="icon-button delete-icon"
                          onClick={() => handleDelete(contrato.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    <div className="contrato-info">
                      <p className="contrato-details"><strong>Cliente:</strong> {contrato.cliente.nombre}</p>
                      <p className="contrato-details"><strong>Paquete:</strong> {contrato.paquete.nombre}</p>
                      <p className="contrato-details"><strong>Fecha Inicio:</strong> {contrato.fecha_inicio}</p>
                      <p className="contrato-details"><strong>Fecha Fin:</strong> {contrato.fecha_fin}</p>
                      <p className="contrato-details"><strong>Dirección:</strong> {contrato.direccion}</p>
                      <p className="contrato-details"><strong>Estado:</strong> {contrato.activo ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No hay contratos disponibles</div>
              )}
            </div>
          </div>
        </div>
     
    </div>
  );
}

export default Contratos;