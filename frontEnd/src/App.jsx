import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Index from './components/Index';
import Canales from './components/Canales';
import Categorias from './components/Categorias';
import Paquetes from './components/Paquetes';
import Clientes from './components/Clientes';
import Contratos from './components/Contratos';
import Bitacora from './components/Bitacora'; 
import NotFound from './components/NotFound';
import ServerError from './components/ServerError';
import Login from './components/Login';
import { jwtDecode } from 'jwt-decode'; 
import BaseLayout from './components/BaseLayout';
import { logout } from './services/authService'; 
import './App.css';
import 'sweetalert2/dist/sweetalert2.css';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';

const ProtectedRoute = ({ isLoggedIn, userRole, allowedRoles, children }) => {
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const Unauthorized = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>403 - Acceso Denegado</h1>
    <p>No tienes los permisos necesarios para ver esta página.</p>
  </div>
);

const getRoleFromToken = () => {
  const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken && decodedToken.rol) {
                 return decodedToken.rol;
            } else {
                 return null;
            }
        } catch (error) {
          void error;
            return null;
        }
    } else {
         return null;
    }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [userRole, setUserRole] = useState(() => getRoleFromToken());
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = !!localStorage.getItem('accessToken');
      setIsLoggedIn(loggedIn);
      setUserRole(getRoleFromToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const role = getRoleFromToken();
    setUserRole(role);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}>
              <BaseLayout> <Index isLoggedIn={isLoggedIn} handleLogout={handleLogout} /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}>
              <BaseLayout> <Clientes /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contratos"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}>
              <BaseLayout> <Contratos /> </BaseLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/canales"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}>
              <BaseLayout> <Canales /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}>
              <BaseLayout> <Categorias /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/paquetes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}>
              <BaseLayout> <Paquetes /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bitacora"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}>
              <BaseLayout> <Bitacora /> </BaseLayout>
            </ProtectedRoute>
          }
        />

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