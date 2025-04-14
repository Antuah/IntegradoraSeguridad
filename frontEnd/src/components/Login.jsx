import React, { useState, useEffect } from 'react';
import '../styles/login.css';
import { login } from '../services/authService';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 

const MySwal = withReactContent(Swal); 

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

    useEffect(() => {
        let timer;
        if (blockTimeRemaining > 0) {
            timer = setInterval(() => {
                setBlockTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (blockTimeRemaining === 0) {
            setIsBlocked(false);
        }
        return () => clearInterval(timer);
    }, [blockTimeRemaining]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBlocked) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await login(username, password);
            setUsername("");
            setPassword("");
            setRemainingAttempts(null);
            onLoginSuccess(response);
        } catch (err) {
            console.warn("❌ Error atrapado desde login:", err);
            const errorStatus = err.status;
            const errorMessage = err.message || "Error desconocido al iniciar sesión.";
            const errorData = err.data || {};

            if (errorStatus === 429) {
                setIsBlocked(true);
                setBlockTimeRemaining(900); // 15 minutos
                setError(errorMessage);
            
                await Swal.fire({
                    icon: 'error',
                    title: 'Cuenta Bloqueada',
                    text: 'Has excedido el número máximo de intentos. Tu cuenta ha sido bloqueada temporalmente por 15 minutos.',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#d33',
                    allowOutsideClick: false
                });
            } else if (errorStatus === 401) {
                setError(errorMessage);
                setRemainingAttempts(errorData.remaining_attempts);

                await Swal.fire({
                    icon: 'warning',
                    title: 'Credenciales Inválidas',
                    text: errorMessage,
                    footer: `Te quedan ${errorData.remaining_attempts ?? "?"} intentos antes de que tu cuenta sea bloqueada`,
                    confirmButtonColor: '#3085d6',
                    allowOutsideClick: false
                });
            } else {
                setError(errorMessage);

                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                    confirmButtonColor: '#3085d6',
                    allowOutsideClick: false
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Iniciar Sesión</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {isBlocked && (
                    <div className="alert alert-warning">
                        Cuenta bloqueada. Podrás intentar nuevamente en: {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')} minutos
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading || isBlocked}
                    >
                        {isLoading ? 'Iniciando sesión...' : isBlocked ? 'Cuenta bloqueada' : 'Iniciar Sesión'}
                    </button>
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
        </div>
    );
};

export default Login;
