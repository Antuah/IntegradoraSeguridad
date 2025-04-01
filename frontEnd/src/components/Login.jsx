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

        try {
            await login(username, password);
            console.log("Login exitoso");
            onLoginSuccess(); 
        } catch (err) {
            setError("Credenciales incorrectas"); 
        }
    };

    return (
        <div className="login-container">
            <h1>Iniciar sesión</h1>
            {error && <p className="error-message">{error}</p>} {/* Mostrar error */}
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
