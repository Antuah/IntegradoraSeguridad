import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const REFRESH_URL = "http://127.0.0.1:8000/usuarios/token/refresh/";

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Refresh token if needed
export const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!token || !refreshToken) {
    throw new Error('No tokens available');
  }
  
  if (isTokenExpired(token)) {
    try {
      const response = await axios.post(REFRESH_URL, {
        refresh: refreshToken
      });
      
      if (response.data && response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        return response.data.access;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error;
    }
  }
  
  return token;
};