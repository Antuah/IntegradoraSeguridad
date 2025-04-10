import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // Importa Navigate y useNavigate

// Importa tus componentes
import Index from './components/Index';
import Canales from './components/Canales';
import Categorias from './components/Categorias';
import Paquetes from './components/Paquetes';
import Clientes from './components/Clientes';
import Contratos from './components/Contratos';
import Bitacora from './components/Bitacora'; // Add this import
import NotFound from './components/NotFound';
import ServerError from './components/ServerError';
import Login from './components/Login';
import './App.css';

// --- Componente Wrapper para Rutas Protegidas (Ejemplo Simple) ---
// Recibe el estado de autenticación y el componente a renderizar
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // Si no está logueado, redirige a /login
    return <Navigate to="/login" replace />;
  }
  // Si está logueado, renderiza el componente hijo (la página protegida)
  return children;
};


function App() {
  // Estado para saber si el usuario está autenticado
  // Intenta leer el token de localStorage al inicio
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const navigate = useNavigate(); // Hook para navegar programáticamente

  // Efecto para actualizar el estado si el token cambia en localStorage (opcional)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };
    window.addEventListener('storage', handleStorageChange);
    // Limpia el listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // --- Función que se pasa al componente Login ---
  const handleLoginSuccess = () => {
    console.log("App.jsx: Login exitoso reportado por el componente Login!");
    setIsLoggedIn(true); // Actualiza el estado de autenticación
    navigate('/'); // Redirige al usuario a la página principal (o a un dashboard)
  };

  // --- Función para cerrar sesión ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Limpia tokens
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false); // Actualiza estado
    navigate('/login'); // Redirige a login
  };


  return (
    // Ya no necesitas <Router> aquí si usas createBrowserRouter,
    // pero si usas <BrowserRouter>, debe envolver todo.
    // Asumiré que sigues usando <BrowserRouter> como en tu código original.
    // Si usas createBrowserRouter, la estructura es un poco diferente.

      <div className="app-container">
        {/* Podrías poner un Navbar aquí que muestre botón de Logout si isLoggedIn es true */}
        {isLoggedIn && (
          <nav>
            {/* Ejemplo de botón logout */}
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </nav>
        )}

        <Routes>
          {/* --- Ruta de Login --- */}
          {/* Si ya está logueado, redirige a Inicio, si no, muestra Login */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} // <--- ¡Aquí pasas la función!
          />

          {/* --- Ruta Principal (Ejemplo Protegido) --- */}
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Index />
              </ProtectedRoute>
            }
          />

          {/* --- OTRAS RUTAS PROTEGIDAS --- */}
          <Route
            path="/canales"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Canales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Categorias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paquetes"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Paquetes />
              </ProtectedRoute>
            }
          />
           <Route
            path="/clientes"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Clientes />
              </ProtectedRoute>
            }
          />
           <Route
            path="/contratos"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Contratos />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/bitacora"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Bitacora /> {/* Change this from Index to Bitacora */}
              </ProtectedRoute>
         }
          />

          {/* --- Rutas Públicas/Error --- */}
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} /> {/* Captura cualquier otra ruta */}

        </Routes>
      </div>

  );
}

// Necesitas envolver App con Router si no usas createBrowserRouter
// Si este es tu punto de entrada principal, podría verse así:
// ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));
// O si usas createBrowserRouter, la estructura cambia.

// --- Wrapper para usar useNavigate dentro de App ---
// React Router v6 requiere que los hooks como useNavigate se usen dentro del contexto del Router.
// Una forma común es crear un componente wrapper o usar App como componente hijo de Router.
// Si el código anterior da error sobre useNavigate fuera de contexto,
// envuelve el return de App con <BrowserRouter> si no lo tienes ya en index.js
// o crea un subcomponente para el contenido de App.

// Solución simple si useNavigate da error aquí:
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper; // Exporta el wrapper
// O export default App; si el Router ya está en index.js envolviendo a <App />