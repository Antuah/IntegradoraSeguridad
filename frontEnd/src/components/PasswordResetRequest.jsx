import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';
import '../styles/Login.css';


function PasswordResetRequest() {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(() => {
    const storedCooldown = localStorage.getItem('passwordResetCooldown');
    if (storedCooldown) {
      const expirationTime = parseInt(storedCooldown);
      if (expirationTime > Date.now()) {
        return Math.ceil((expirationTime - Date.now()) / 1000);
      }
    }
    return 0;
  });

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      // Store cooldown expiration time in localStorage
      localStorage.setItem('passwordResetCooldown', String(Date.now() + cooldown * 1000));
      
      timer = setInterval(() => {
        setCooldown(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            localStorage.removeItem('passwordResetCooldown');
          }
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return; // Prevent submission during cooldown
    
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await requestPasswordReset(username);
      setMessage(response.detail || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
      setUsername('');
      // Add a local cooldown even on success to prevent spam
      setCooldown(60); // 60 seconds cooldown on successful request
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Has excedido el límite de intentos. Por favor, espera 1 hora.');
        setCooldown(3600); // 1 hour cooldown
      } else if (err.response?.status === 404) {
        setError(err.response.data.detail || 'No existe una cuenta con este correo electrónico.');
      } else {
        setError(err.response?.data?.detail || 'Ha ocurrido un error. Por favor intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Recuperar Contraseña</h2>
        <p className="login-subtitle">Ingresa tu correo electrónico para recibir instrucciones</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Correo Electrónico</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ingresa tu correo electrónico"
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isSubmitting || !username}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/login" className="login-link">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetRequest;