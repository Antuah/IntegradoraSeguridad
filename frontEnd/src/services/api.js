import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.url?.includes('/token/refresh/')) {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        void error
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const canalesApi = {
    getCategorias: () => apiClient.get(`/canales/categorias/`),
    getCategoria: (id) => apiClient.get(`/canales/categorias/${id}/`),
    createCategoria: (data) => apiClient.post(`/canales/categorias/`, data),
    updateCategoria: (id, data) => apiClient.put(`/canales/categorias/${id}/`, data),
    deleteCategoria: (id) => apiClient.delete(`/canales/categorias/${id}/`),
    getCanales: () => apiClient.get(`/canales/canales/`),
    getCanal: (id) => apiClient.get(`/canales/canales/${id}/`),
    createCanal: (data) => apiClient.post(`/canales/canales/`, data),
    updateCanal: (id, data) => apiClient.put(`/canales/canales/${id}/`, data),
    deleteCanal: (id) => apiClient.delete(`/canales/canales/${id}/`),
};

export const paquetesApi = {
    getPaquetes: () => apiClient.get(`/paquetes/paquetes/`),
    getPaquete: (id) => apiClient.get(`/paquetes/paquetes/${id}/`),
    createPaquete: (data) => apiClient.post(`/paquetes/paquetes/`, data),
    updatePaquete: (id, data) => apiClient.put(`/paquetes/paquetes/${id}/`, data),
    deletePaquete: (id) => apiClient.delete(`/paquetes/paquetes/${id}/`),
};

export const contratosApi = {
    getContratos: () => apiClient.get(`/contratos/contratos/`),
    getContrato: (id) => apiClient.get(`/contratos/contratos/${id}/`),
    createContrato: (data) => apiClient.post(`/contratos/contratos/`, data),
    updateContrato: (id, data) => apiClient.put(`/contratos/contratos/${id}/`, data),
    deleteContrato: (id) => apiClient.delete(`/contratos/contratos/${id}/`)
};

export const clientesApi = {
    getClientes: () => apiClient.get(`/clientes/clientes/`),
    getCliente: (id) => apiClient.get(`/clientes/clientes/${id}/`),
    createCliente: (data) => apiClient.post(`/clientes/clientes/`, data),
    updateCliente: (id, data) => apiClient.put(`/clientes/clientes/${id}/`, data),
    deleteCliente: (id) => apiClient.delete(`/clientes/clientes/${id}/`),
};

export const bitacoraApi = {
    getRegistros: () => apiClient.get(`/bitacora/bitacora/`),
    getRegistrosFiltrados: (params) => apiClient.get(`/bitacora/bitacora/`, { params }),
};