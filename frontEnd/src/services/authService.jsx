import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/usuarios/token/"; 
const REFRESH_URL = "http://127.0.0.1:8000/usuarios/token/refresh/";
const LOGOUT_URL = "http://127.0.0.1:8000/usuarios/logout/";

export const login = async (username, password) => {
    try {
        // Log para saber qué URL se está usando
        console.log("authService.login: Intentando axios.post a", API_URL);
        const response = await axios.post(API_URL, { username, password });

        // --- LOGS DETALLADOS DE LA RESPUESTA ---
        console.log("authService.login: Respuesta RECIBIDA. Status:", response.status);
        console.log("authService.login: Datos recibidos (response.data):", response.data);

        // Verifica si la data y el token existen
        if (response.data && response.data.access) {
            console.log("authService.login: Token 'access' ENCONTRADO. Guardando en localStorage.");
            localStorage.setItem("accessToken", response.data.access);
            if (response.data.refresh) {
                localStorage.setItem("refreshToken", response.data.refresh);
            }
            // Retorna los datos solo si el token access fue encontrado
            return response.data;
        } else {
            // --- Respuesta OK pero sin token ---
            console.warn("authService.login: Respuesta 2xx OK, PERO 'response.data.access' NO encontrado o es null/undefined.");
            // Lanzamos un error aquí porque la falta de token es un fallo lógico para el login
            throw new Error("Respuesta del servidor OK pero sin token de acceso.");
        }

    } catch (error) {
        console.error("authService.login: CATCH block triggered. Error:", error);
        if (error.response) { // Error HTTP (4xx, 5xx)
            console.error("authService.login CATCH: Response Data:", error.response.data);
            console.error("authService.login CATCH: Response Status:", error.response.status);
        } else if (error.request) { // No hubo respuesta
            console.error("authService.login CATCH: No response received. Request:", error.request);
        } else { // Error de configuración
            console.error('authService.login CATCH: Axios config error:', error.message);
        }
        // Propaga un error más informativo si es posible
        const message = error.response?.data?.detail || error.message || "Credenciales incorrectas o error de servidor";
        throw new Error(message); // Lanza el error para que Login.jsx lo capture
    }
};

// Función para cerrar sesión
export const logout = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Registrar el cierre de sesión en el backend
            await axios.post(LOGOUT_URL, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error("Error al registrar cierre de sesión:", error);
    } finally {
        // Siempre limpiar el localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.reload(); // Recargar para limpiar el estado
    }
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
