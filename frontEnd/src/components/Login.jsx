import React, { useState } from 'react';
import '../styles/login.css';
import { login } from '../services/authService';
import { Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            await login(username, password);
            onLoginSuccess(); 
        } catch (err) {
            setError(err.message || "Credenciales incorrectas o problema al procesar."); 
        }
    };

    return (
        <>
            <nav className="navbar">
                <h1 className="navbar-title">Sistema de Gestión de Contratos</h1>
            </nav>
            <div className="login-container">
                <h1>Iniciar sesión</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Ingrese su usuario"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Ingrese su contraseña"
                        />
                    </div>
                    <button type="submit">Iniciar sesión</button>
                </form>
                <div className="login-footer">
                  <p>
                    ¿Olvidaste tu contraseña?{' '}
                    <Link to="/reset-password" className="forgot-password-link">
                      Recuperar contraseña
                    </Link>
                  </p>
                </div>
            </div>
        </>
    );
};

export default Login;
