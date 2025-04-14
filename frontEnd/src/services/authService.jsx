import axios from 'axios';


const API_URL = "http://127.0.0.1:8000/usuarios/token/"; 
const REFRESH_URL = "http://127.0.0.1:8000/usuarios/token/refresh/";
const LOGOUT_URL = "http://127.0.0.1:8000/usuarios/logout/";

export const login = async (username, password) => {
    try {
        const response = await axios.post(API_URL, { username, password });
        if (response.data && response.data.access) {
            localStorage.setItem("accessToken", response.data.access);
            if (response.data.refresh) {
                localStorage.setItem("refreshToken", response.data.refresh);
            }
            return response.data;
        } else {
            throw new Error("Respuesta del servidor OK pero sin token de acceso.");
        }

    } catch (error) {       
        const message = error.response?.data?.detail || error.message || "Credenciales incorrectas o error de servidor";
        throw {
            status: error.response?.status || 500,
            data: error.response?.data,
            message: message
          };
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            await axios.post(LOGOUT_URL, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        void error;
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.reload(); 
    }
};

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
            return refreshToken().then(() => fetchWithAuth(url, options));
        }
        throw error;
    }
};

export const refreshToken = async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) throw new Error("No hay refresh token");

    try {
        const response = await axios.post(REFRESH_URL, { refresh });

        localStorage.setItem("accessToken", response.data.access);
    } catch (error) {
        logout(); 
        throw error;
    }
};


export const requestPasswordReset = async (username) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/usuarios/password-reset/', { username });
    return response.data;
  } catch (error) {
      void error;
  }
};

export const resetPassword = async (uidb64, token, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/usuarios/password-reset-confirm/${uidb64}/${token}/`, 
      { 
        new_password: newPassword,
        confirm_password: confirmPassword
      }
    );
    return response.data;
  } catch (error) {
    void error;
  }
};
