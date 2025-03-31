import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canalesApi } from '../services/api';
import '../styles/Canales.css';


function Canales() {
  const navigate = useNavigate();
  const [canales, setCanales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [currentCanal, setCurrentCanal] = useState({
    nombre: '',
    categoria: '',
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCanales();
    loadCategorias();
  }, []);

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      console.log('Canales response:', response.data); // For debugging
      setCanales(response.data);
    } catch (error) {
      console.error('Error loading canales:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      console.log('Categorias response:', response.data); // For debugging
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: currentCanal.nombre,
        categoria: currentCanal.categoria,
        imagen_url: currentCanal.imagen_url
      };

      if (isEditing) {
        await canalesApi.updateCanal(currentCanal.id, formData);
      } else {
        await canalesApi.createCanal(formData);
      }
      setCurrentCanal({
        nombre: '',
        categoria: '',
        imagen_url: ''
      });
      setIsEditing(false);
      await loadCanales();
    } catch (error) {
      console.error('Error saving canal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este canal?')) {
      try {
        await canalesApi.deleteCanal(id);
        loadCanales();
      } catch (error) {
        console.error('Error deleting canal:', error);
      }
    }
  };

  const handleEdit = (canal) => {
    setCurrentCanal(canal);
    setIsEditing(true);
  };

  return (
    <div className="canales-container">
      <div className="header-with-nav">
        <button className="back-button" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
        <h2>{isEditing ? 'Editar Canal' : 'Nuevo Canal'}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={currentCanal.nombre}
            onChange={(e) => setCurrentCanal({...currentCanal, nombre: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Categoría:</label>
          <select
            value={currentCanal.categoria}
            onChange={(e) => setCurrentCanal({...currentCanal, categoria: e.target.value})}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label>URL de la imagen:</label>
          <input
            type="url"
            value={currentCanal.imagen_url}
            onChange={(e) => setCurrentCanal({...currentCanal, imagen_url: e.target.value})}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
        <div className="form-buttons">
          <button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</button>
          {isEditing && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setCurrentCanal({
                  nombre: '',
                  categoria: ''
                });
                setIsEditing(false);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Lista de Canales</h2>
      <div className="canales-list">
        {canales.map(canal => (
          <div key={canal.id} className="canal-card">
            {canal.imagen_url && (
              <img 
                src={canal.imagen_url} 
                alt={canal.nombre}
                className="canal-imagen"
              />
            )}
            <h3>{canal.nombre}</h3>
            <p>Categoría: {categorias.find(cat => cat.id === canal.categoria)?.nombre || 'No asignada'}</p>
            <div className="card-buttons">
              <button onClick={() => handleEdit(canal)}>Editar</button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(canal.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Canales;