import React, { useState } from 'react';
import '../styles/login.css';
import { login } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        console.log("Login.jsx: handleLogin iniciado."); // Log inicio
    
        try {
            console.log("Login.jsx: Llamando a authService.login...");
            const data = await login(username, password); // Llama a la versión modificada
            // --- LOG DETALLADO DEL ÉXITO ---
            console.log("Login.jsx: authService.login retornó SIN ERRORES. Datos recibidos:", data);
            console.log("Login.jsx: Ejecutando onLoginSuccess...");
            onLoginSuccess(); // ¿Qué hace esta función exactamente?
            console.log("Login.jsx: onLoginSuccess ejecutado SIN ERRORES.");
        } catch (err) {
            // --- LOG DETALLADO DEL ERROR ---
            console.error("Login.jsx: CATCH block triggered. Error recibido:", err);
            console.error("Login.jsx CATCH: Mensaje de error:", err.message); // Muestra el mensaje del error lanzado
            setError(err.message || "Credenciales incorrectas o problema al procesar."); // Usa el mensaje del error si existe
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
            </div>
        </>
    );
};

export default Login;
