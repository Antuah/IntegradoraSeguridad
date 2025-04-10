import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';
import '../styles/Clientes.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt } from 'react-icons/fa';

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
          <button className="active" onClick={() => navigate('/clientes')}>
            <FaUsers /> Clientes
          </button>
          <button onClick={() => navigate('/contratos')}>
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
          <h2>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              value={currentCliente.nombre}
              onChange={(e) => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
              required
              maxLength={255}
            />
          </div>
          <div>
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
          <div>
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
          <div>
            <label>Dirección:</label>
            <textarea
              value={currentCliente.direccion}
              onChange={(e) => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
              required
            />
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

        <h2>Lista de Clientes</h2>
        <div className="clientes-grid">
          {clientes.map(cliente => (
            <div key={cliente.id} className="cliente-card">
              <h3>{cliente.nombre}</h3>
              <p><strong>RFC:</strong> {cliente.rfc}</p>
              <p><strong>Teléfono:</strong> {cliente.telefono}</p>
              <p><strong>Dirección:</strong> {cliente.direccion}</p>
              <div className="card-buttons">
                <button onClick={() => handleEdit(cliente)}>Editar</button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(cliente.id)}
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

export default Clientes;