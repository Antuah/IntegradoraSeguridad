import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/usuarios/token/"; 
const REFRESH_URL = "http://127.0.0.1:8000/usuarios/token/refresh/";

// Función para iniciar sesión
export const login = async (username, password) => {
    try {
        const response = await axios.post(API_URL, { username, password });

        if (response.data.access) {
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);
        }
        return response.data;
    } catch (error) {
        console.error("Error en el login", error);
        throw new Error("Credenciales incorrectas");
    }
};

// Función para cerrar sesión
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.reload(); // Recargar para limpiar el estado
};

// Función para hacer peticiones con autenticación
export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        throw new Error("No hay token de acceso");
    }

    try {
        const response = await axios({
            url,
            headers: { Authorization: `Bearer ${token}` },
            ...options
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Intentar refrescar el token si expira
            return refreshToken().then(() => fetchWithAuth(url, options));
        }
        throw error;
    }
};

// Función para refrescar el token de acceso cuando expira
export const refreshToken = async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) throw new Error("No hay refresh token");

    try {
        const response = await axios.post(REFRESH_URL, { refresh });

        localStorage.setItem("accessToken", response.data.access);
    } catch (error) {
        console.error("Error al refrescar el token", error);
        logout(); // Si no se puede refrescar, cerramos sesión
        throw error;
    }
};
