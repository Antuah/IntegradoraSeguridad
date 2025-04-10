import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratosApi, clientesApi, paquetesApi } from '../services/api';
import '../styles/Contratos.css';

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
    cliente: ''
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
      console.error('Error loading contratos:', error);
      navigate('/500');
    }
  };

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getClientes();
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      console.error('Error loading paquetes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contratoData = {
        fecha_inicio: currentContrato.fecha_inicio,
        fecha_fin: currentContrato.fecha_fin,
        activo: currentContrato.activo,
        paquete: currentContrato.paquete,
        cliente: currentContrato.cliente
      };

      if (isEditing) {
        await contratosApi.updateContrato(currentContrato.id, contratoData);
      } else {
        await contratosApi.createContrato(contratoData);
      }

      setCurrentContrato({
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
        paquete: '',
        cliente: ''
      });
      setIsEditing(false);
      await loadContratos();
    } catch (error) {
      console.error('Error saving contrato:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
                           'Error al guardar el contrato. Por favor, verifique los datos.';
        alert(errorMessage);
      } else {
        navigate('/500');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este contrato?')) {
      try {
        await contratosApi.deleteContrato(id);
        await loadContratos();
      } catch (error) {
        console.error('Error deleting contrato:', error);
        navigate('/500');
      }
    }
  };

  const handleEdit = (contrato) => {
    setCurrentContrato({
      id: contrato.id,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
      activo: contrato.activo,
      paquete: contrato.paquete.id,
      cliente: contrato.cliente.id
    });
    setIsEditing(true);
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
                    onChange={(e) => setCurrentContrato({...currentContrato, fecha_inicio: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin:</label>
                  <input
                    type="date"
                    value={currentContrato.fecha_fin}
                    onChange={(e) => setCurrentContrato({...currentContrato, fecha_fin: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cliente:</label>
                  <select
                    value={currentContrato.cliente}
                    onChange={(e) => setCurrentContrato({...currentContrato, cliente: e.target.value})}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - RFC: {cliente.rfc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Paquete:</label>
                  <select
                    value={currentContrato.paquete}
                    onChange={(e) => setCurrentContrato({...currentContrato, paquete: e.target.value})}
                    required
                  >
                    <option value="">Seleccione un paquete</option>
                    {paquetes.map(paquete => (
                      <option key={paquete.id} value={paquete.id}>
                        {paquete.nombre} - ${paquete.precio}
                      </option>
                    ))}
                  </select>
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
                          cliente: ''
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