// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

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
import BaseLayout from './components/BaseLayout';
import './App.css';

import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
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

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        
        {/* Add these new routes for password reset */}
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />

        {/* Páginas protegidas con layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Index />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/canales"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Canales />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Categorias />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/paquetes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Paquetes />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Clientes />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contratos"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <BaseLayout>
                <Contratos />
              </BaseLayout>
              </ProtectedRoute>
            }
          />

          <Route 
            path="/bitacora"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <BaseLayout>
                <Bitacora /> {/* Change this from Index to Bitacora */}
                </BaseLayout>
              </ProtectedRoute>
         }
          />

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