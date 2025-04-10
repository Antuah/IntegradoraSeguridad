// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Index from './components/Index';
import Canales from './components/Canales';
import Categorias from './components/Categorias';
import Paquetes from './components/Paquetes';
import Clientes from './components/Clientes';
import Contratos from './components/Contratos';
import NotFound from './components/NotFound';
import ServerError from './components/ServerError';
import Login from './components/Login';
import BaseLayout from './components/BaseLayout';
import './App.css';
import { logout as authLogout } from './services/authService'; // Importa la función de logout

const ProtectedRoute = ({ isLoggedIn, children }) => {
  console.log("ProtectedRoute: Verificando estado isLoggedIn =", isLoggedIn); // Log para depurar
  if (!isLoggedIn) {
<<<<<<< HEAD
    return <Navigate to="/login" replace />;
  }
=======
    console.log("ProtectedRoute: isLoggedIn es false, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }
  // console.log("ProtectedRoute: isLoggedIn es true, mostrando children"); // Puedes descomentar si quieres ver cuando permite acceso
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

<<<<<<< HEAD
=======
  // --- Función para cerrar sesión ---
  const handleLogout = () => {
    console.log("App.jsx: Ejecutando handleLogout...");
    // Ahora sí debería encontrar 'authLogout' porque la importaste arriba
    authLogout();
    setIsLoggedIn(false);
    console.log("App.jsx: Estado isLoggedIn actualizado a false.");
    // navigate('/login'); // Opcional, si quieres redirigir desde aquí
};


>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />

<<<<<<< HEAD
        {/* Páginas protegidas con layout */}
=======
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
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Index />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
=======
              {/* Pasas isLoggedIn y handleLogout a Index */}
              <Index isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* --- OTRAS RUTAS PROTEGIDAS --- */}
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
        <Route
          path="/canales"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Canales />
              </BaseLayout>
=======
              <Canales />
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Categorias />
              </BaseLayout>
=======
              <Categorias />
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
            </ProtectedRoute>
          }
        />
        <Route
          path="/paquetes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Paquetes />
              </BaseLayout>
=======
              <Paquetes />
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Clientes />
              </BaseLayout>
=======
              <Clientes />
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011
            </ProtectedRoute>
          }
        />
        <Route
          path="/contratos"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
<<<<<<< HEAD
              <BaseLayout>
                <Contratos />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
=======
              <Contratos />
            </ProtectedRoute>
          }
        />

        {/* --- Rutas Públicas/Error --- */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} /> {/* Captura cualquier otra ruta */}

      </Routes>
    </div>
>>>>>>> cad7b6508b6fdaf969dbe5e8b180cec4e2e3a011

        {/* Páginas públicas */}
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
