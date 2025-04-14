import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import '../styles/Login.css';

function PasswordResetConfirm() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await resetPassword(
        uidb64, 
        token, 
        formData.newPassword, 
        formData.confirmPassword
      );
      setMessage(response.detail || 'Tu contraseña ha sido restablecida exitosamente.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ha ocurrido un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Crear Nueva Contraseña</h2>
        <p className="login-subtitle">Ingresa y confirma tu nueva contraseña</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nueva contraseña"
              disabled={isSubmitting}
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirma tu nueva contraseña"
              disabled={isSubmitting}
              minLength="8"
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isSubmitting || !formData.newPassword || !formData.confirmPassword}
          >
            {isSubmitting ? 'Procesando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/login" className="login-link">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;