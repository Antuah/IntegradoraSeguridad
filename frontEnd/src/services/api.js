import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const canalesApi = {
    getCategorias: () => axios.get(`${API_URL}/canales/categorias/`),
    getCategoria: (id) => axios.get(`${API_URL}/canales/categorias/${id}/`),
    createCategoria: (data) => axios.post(`${API_URL}/canales/categorias/`, data),
    updateCategoria: (id, data) => axios.put(`${API_URL}/canales/categorias/${id}/`, data),
    deleteCategoria: (id) => axios.delete(`${API_URL}/canales/categorias/${id}/`),
    getCanales: () => axios.get(`${API_URL}/canales/canales/`),
    getCanal: (id) => axios.get(`${API_URL}/canales/canales/${id}/`),
    createCanal: (data) => axios.post(`${API_URL}/canales/canales/`, data),
    updateCanal: (id, data) => axios.put(`${API_URL}/canales/canales/${id}/`, data),
    deleteCanal: (id) => axios.delete(`${API_URL}/canales/canales/${id}/`),
};

export const paquetesApi = {
    getPaquetes: () => axios.get(`${API_URL}/paquetes/paquetes/`),
    getPaquete: (id) => axios.get(`${API_URL}/paquetes/paquetes/${id}/`),
    createPaquete: (data) => axios.post(`${API_URL}/paquetes/paquetes/`, data),
    updatePaquete: (id, data) => axios.put(`${API_URL}/paquetes/paquetes/${id}/`, data),
    deletePaquete: (id) => axios.delete(`${API_URL}/paquetes/paquetes/${id}/`),
};