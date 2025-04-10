import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratosApi, clientesApi, paquetesApi } from '../services/api';
import '../styles/Contratos.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt } from 'react-icons/fa';

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
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>
            <AiFillHome /> Inicio
          </button>
          <button onClick={() => navigate('/categorias')}>
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
          <button className="active" onClick={() => navigate('/contratos')}>
            <FaFileContract /> Contratos
          </button>
          <button onClick={() => navigate('/login')}>
            <FaSignInAlt /> Iniciar Sesión
          </button>
        </div>
      </nav>

      <main className="main-content">
      <div className="header-with-nav">
        <button className="back-button" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
        <h2>{isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="contrato-form">
        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            value={currentContrato.fecha_inicio}
            onChange={(e) => setCurrentContrato({...currentContrato, fecha_inicio: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Fecha de Fin:</label>
          <input
            type="date"
            value={currentContrato.fecha_fin}
            onChange={(e) => setCurrentContrato({...currentContrato, fecha_fin: e.target.value})}
            required
          />
        </div>
        <div>
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
        <div>
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
          <button type="submit">
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

      <h2>Lista de Contratos</h2>
      <div className="contratos-grid">
        {contratos.map(contrato => (
          <div key={contrato.id} className="contrato-card">
            <h3>Contrato #{contrato.id.slice(0, 8)}</h3>
            <p><strong>Cliente:</strong> {contrato.cliente.nombre}</p>
            <p><strong>Paquete:</strong> {contrato.paquete.nombre}</p>
            <p><strong>Fecha Inicio:</strong> {contrato.fecha_inicio}</p>
            <p><strong>Fecha Fin:</strong> {contrato.fecha_fin}</p>
            <p><strong>Estado:</strong> {contrato.activo ? 'Activo' : 'Inactivo'}</p>
            <div className="card-buttons">
              <button onClick={() => handleEdit(contrato)}>Editar</button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(contrato.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      </main>
      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Contratos;