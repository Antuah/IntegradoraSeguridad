import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Bitacora.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt, FaHistory } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { bitacoraApi } from '../services/api';

const API_URL = 'http://localhost:8000/api';

function Bitacora() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    entidad: '',
    accion: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Get current date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarRegistros();
  }, [currentPage, itemsPerPage]); // Reload when page or items per page changes

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      console.log("Bitacora: Intentando cargar registros");
      
      // Use the bitacoraApi service which already includes auth headers
      const response = await bitacoraApi.getRegistros();
      
      console.log("Bitacora: Registros cargados exitosamente", response.data);
      setRegistros(response.data);
      setTotalItems(response.data.length);
      setError(null);
    } catch (err) {
      console.error('Error al cargar registros de bitácora:', err);
      
      // More specific error message based on the error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('No autorizado. Por favor inicie sesión nuevamente.');
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (err.response.status === 500) {
          setError('Error interno del servidor. Por favor contacte al administrador.');
        } else {
          setError(`Error ${err.response.status}: ${err.response.data?.detail || 'No se pudieron cargar los registros'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No se recibió respuesta del servidor. Verifique su conexión.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      // Create params object for filtering
      const params = {};
      if (filtros.entidad) params.entidad = filtros.entidad;
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.fechaDesde) params.fecha_desde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
      
      // Use the bitacoraApi service which already includes auth headers
      const response = await bitacoraApi.getRegistrosFiltrados(params);
      setRegistros(response.data);
      setTotalItems(response.data.length);
      setCurrentPage(1); // Reset to first page when applying filters
      setError(null);
    } catch (err) {
      console.error('Error al filtrar registros:', err);
      if (err.response && err.response.status === 401) {
        setError('No autorizado. Por favor inicie sesión nuevamente.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Error al aplicar filtros');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-MX');
  };

  // Actualizar la función getAccionLabel para mostrar etiquetas más descriptivas
  const getAccionLabel = (accion) => {
    const acciones = {
      'INICIO_SESION': 'Inicio de Sesión',
      'CIERRE_SESION': 'Cierre de Sesión',
      'CREACION': 'Creación',
      'EDICION': 'Edición',
      'ELIMINACION': 'Eliminación',
      'CONSULTA': 'Consulta'
    };
    return acciones[accion] || accion;
  };
  
  // Enhanced function to format details in a more readable way
  const formatearDetalles = (detalles, accion, entidad) => {
    if (!detalles) return "No hay detalles disponibles";
    
    try {
      // Parse details if it's a string
      const detailsObj = typeof detalles === 'string' ? JSON.parse(detalles) : detalles;
      
      // Create a summary based on action type
      switch(accion) {
        case 'CREACION':
          return `Se creó ${entidad.toLowerCase()} con los siguientes datos: ${summarizeObject(detailsObj)}`;
        
        case 'EDICION':
          return `Se modificaron los siguientes campos: ${summarizeObject(detailsObj)}`;
        
        case 'ELIMINACION':
          return `Se eliminó ${entidad.toLowerCase()} con ID: ${detailsObj.id || 'No especificado'}`;
        
        case 'INICIO_SESION':
          return `Inicio de sesión exitoso`;
        
        case 'CIERRE_SESION':
          return `Cierre de sesión exitoso`;
          
        case 'CONSULTA':
          return `Se consultó información de ${entidad.toLowerCase()}`;
          
        default:
          // For unknown actions, show a simplified version of the details
          return summarizeObject(detailsObj);
      }
    } catch (e) {
      // If parsing fails, return the original details as string
      return typeof detalles === 'string' ? detalles : JSON.stringify(detalles);
    }
  };
  
  // Helper function to create a summary of an object
  const summarizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return 'No hay datos';
    
    // Filter out common fields we don't want to show
    const fieldsToExclude = ['password', 'token', 'refresh_token', 'raw'];
    
    // Get the keys we want to display
    const keys = Object.keys(obj).filter(key => 
      !fieldsToExclude.includes(key) && 
      obj[key] !== null && 
      obj[key] !== undefined
    );
    
    // If there are too many fields, just show the most important ones
    if (keys.length > 5) {
      // Try to find important keys
      const importantKeys = ['id', 'nombre', 'username', 'email', 'descripcion']
        .filter(key => keys.includes(key));
      
      // If we found important keys, show those plus a count of others
      if (importantKeys.length > 0) {
        const otherCount = keys.length - importantKeys.length;
        const summary = importantKeys.map(key => `${key}: ${formatValue(obj[key])}`).join(', ');
        return `${summary}${otherCount > 0 ? ` y ${otherCount} campos más` : ''}`;
      }
    }
    
    // Otherwise show all fields (up to a reasonable limit)
    const displayKeys = keys.slice(0, 5);
    const summary = displayKeys.map(key => `${key}: ${formatValue(obj[key])}`).join(', ');
    
    // Indicate if there are more fields
    const remainingCount = keys.length - displayKeys.length;
    return `${summary}${remainingCount > 0 ? ` y ${remainingCount} campos más` : ''}`;
  };
  
  // Helper to format values nicely
  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.length > 3 
          ? `[${value.slice(0, 3).join(', ')}... y ${value.length - 3} más]` 
          : `[${value.join(', ')}]`;
      }
      return '{objeto}';
    }
    
    // For strings, truncate if too long
    if (typeof value === 'string' && value.length > 30) {
      return `"${value.substring(0, 27)}..."`;
    }
    
    return String(value);
  };

  const getAccionClass = (accion) => {
    const clases = {
      'INICIO_SESION': 'badge-success',
      'CIERRE_SESION': 'badge-secondary',
      'CREACION': 'badge-primary',
      'EDICION': 'badge-warning',
      'ELIMINACION': 'badge-danger',
      'CONSULTA': 'badge-info'
    };
    return `badge ${clases[accion] || 'badge-secondary'}`;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = registros.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDateChange = (e, field) => {
    const { value } = e.target;
    
    // Validate that the date is not in the future
    if (value > today) {
      alert('No se pueden seleccionar fechas futuras');
      return;
    }
    
    // If fechaHasta is being set, ensure it's not before fechaDesde
    if (field === 'fechaHasta' && filtros.fechaDesde && value < filtros.fechaDesde) {
      alert('La fecha final no puede ser anterior a la fecha inicial');
      return;
    }
    
    // If fechaDesde is being set, ensure it's not after fechaHasta
    if (field === 'fechaDesde' && filtros.fechaHasta && value > filtros.fechaHasta) {
      alert('La fecha inicial no puede ser posterior a la fecha final');
      return;
    }
    
    setFiltros({...filtros, [field]: value});
  };

  return (
    <div className="page-container">
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
          <button onClick={() => navigate('/contratos')}>
            <FaFileContract /> Contratos
          </button>
          <button className="active">
            <FaHistory /> Bitácora
          </button>
          <button onClick={() => navigate('/login')}>
            <FaSignInAlt /> Iniciar Sesión
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1>Bitácora de Actividades</h1>
        
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label>Entidad</label>
              <select 
                className="form-control"
                value={filtros.entidad}
                onChange={(e) => setFiltros({...filtros, entidad: e.target.value})}
              >
                <option value="">Todas</option>
                <option value="Canal">Canales</option>
                <option value="Categoria">Categorías</option>
                <option value="Paquete">Paquetes</option>
                <option value="Cliente">Clientes</option>
                <option value="Contrato">Contratos</option>
                <option value="Usuario">Usuarios</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Acción</label>
              <select 
                className="form-control"
                value={filtros.accion}
                onChange={(e) => setFiltros({...filtros, accion: e.target.value})}
              >
                <option value="">Todas</option>
                <option value="INICIO_SESION">Inicio de Sesión</option>
                <option value="CIERRE_SESION">Cierre de Sesión</option>
                <option value="CREACION">Creación</option>
                <option value="EDICION">Edición</option>
                <option value="ELIMINACION">Eliminación</option>
                <option value="CONSULTA">Consulta</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Desde</label>
              <input 
                type="date" 
                className="form-control"
                value={filtros.fechaDesde}
                onChange={(e) => handleDateChange(e, 'fechaDesde')}
                max={today}
              />
            </div>
            
            <div className="form-group">
              <label>Hasta</label>
              <input 
                type="date" 
                className="form-control"
                value={filtros.fechaHasta}
                onChange={(e) => handleDateChange(e, 'fechaHasta')}
                max={today}
              />
            </div>
          </div>
          
          <div className="form-buttons">
            <button className="btn btn-primary" onClick={aplicarFiltros}>
              Aplicar Filtros
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setFiltros({
                  entidad: '',
                  accion: '',
                  fechaDesde: '',
                  fechaHasta: '',
                });
                setCurrentPage(1); // Reset to first page
                cargarRegistros();
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando registros...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Entidad</th>
                    <th>Dirección IP</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map(registro => (
                      <tr key={registro.id}>
                        <td>{formatearFecha(registro.fecha_hora)}</td>
                        <td>{registro.usuario_details?.username || 'Usuario eliminado'}</td>
                        <td>
                          <span className={getAccionClass(registro.accion)}>
                            {getAccionLabel(registro.accion)}
                          </span>
                        </td>
                        <td>{registro.entidad}</td>
                        <td>{registro.direccion_ip || '-'}</td>
                        <td>
                          {registro.detalles ? (
                            <details>
                              <summary>Ver resumen</summary>
                              <div className="details-summary">
                                {formatearDetalles(registro.detalles, registro.accion, registro.entidad)}
                              </div>
                              {/* Optional: Add a button to view raw JSON if needed */}
                              <button 
                                className="view-raw-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(JSON.stringify(registro.detalles, null, 2));
                                }}
                              >
                                Ver JSON completo
                              </button>
                            </details>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-message">
                        No hay registros de actividad
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            <div className="pagination-container">
              <div className="pagination-info">
                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} de {totalItems} registros
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-button" 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                
                {/* Page numbers */}
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If near start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If near end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show 2 before and 2 after current page
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  className="pagination-button" 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
              
              <div className="items-per-page">
                <label>Registros por página:</label>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Bitacora;