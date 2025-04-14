// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

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
import { jwtDecode } from 'jwt-decode'; // <-- Importa jwt-decode
import BaseLayout from './components/BaseLayout';
import { logout } from './services/authService'; // <-- Importa el servicio de logout
import './App.css';
import 'sweetalert2/dist/sweetalert2.css';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';



const ProtectedRoute = ({ isLoggedIn, userRole, allowedRoles, children }) => {
  const location = useLocation(); // Para saber desde dónde se intentó acceder

  // 1. Si no está logueado, redirige a login
  if (!isLoggedIn) {
    console.log("ProtectedRoute: No logueado. Redirigiendo a /login");
    // state={{ from: location }} permite redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si se especificaron roles permitidos Y el rol del usuario NO está en la lista...
  //    (allowedRoles debe ser un array, ej: ['Administrador', 'Promotor'])
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`ProtectedRoute: Acceso denegado. Rol '${userRole}' no está en [${allowedRoles.join(', ')}]. Redirigiendo a /unauthorized`);
    // Redirige a una página específica de "No Autorizado"
    return <Navigate to="/unauthorized" replace />;
    // O podrías redirigir a la página principal: return <Navigate to="/" replace />;
  }

  // 3. Si está logueado Y (no se especificaron roles O su rol está permitido) -> Muestra el contenido
  // console.log(`ProtectedRoute: Acceso permitido para rol '${userRole}'.`);
  return children;
};

const Unauthorized = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>403 - Acceso Denegado</h1>
    <p>No tienes los permisos necesarios para ver esta página.</p>
    {/* Puedes añadir un Link para volver al inicio */}
    {/* <Link to="/">Volver al Inicio</Link> */}
  </div>
);


const getRoleFromToken = () => {
  const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            // --- LOGS MÁS DETALLADOS ---
            console.log("getRoleFromToken: Raw Decoded Token:", decodedToken);
            // Imprime específicamente el valor y el tipo del campo 'rol'
            console.log("getRoleFromToken: Valor de decodedToken.rol:", decodedToken.rol);
            console.log("getRoleFromToken: Tipo de decodedToken.rol:", typeof decodedToken.rol);
            // --- FIN LOGS ---

            // La condición original para verificar que existe y no es null/undefined/vacío
            if (decodedToken && decodedToken.rol) {
                 console.log("getRoleFromToken: Campo 'rol' encontrado y es truthy, retornando:", decodedToken.rol);
                 return decodedToken.rol;
            } else {
                 // Este es el log que estabas viendo antes
                 console.warn("getRoleFromToken: Condición 'decodedToken && decodedToken.rol' fue false.");
                 return null;
            }
        } catch (error) {
            console.error("Error decodificando token:", error);
            return null;
        }
    } else {
         console.log("getRoleFromToken: No se encontró accessToken en localStorage.");
         return null;
    }
};

function App() {
  // --- ESTADOS ---
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  // Nuevo estado para el rol, intenta leerlo del token al inicio
  const [userRole, setUserRole] = useState(() => getRoleFromToken()); // <-- Nuevo estado
  const navigate = useNavigate();

  // --- Efecto para cambios en localStorage (opcional pero útil) ---
  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = !!localStorage.getItem('accessToken');
      setIsLoggedIn(loggedIn);
      setUserRole(getRoleFromToken()); // Actualiza rol también
    };
    // Escucha cambios en otras pestañas/ventanas
    window.addEventListener('storage', handleStorageChange);
    // Podrías añadir un listener para 'local-storage' si modificas localStorage en la misma pestaña
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // --- Manejador de Login Exitoso (MODIFICADO) ---
  const handleLoginSuccess = () => {
    console.log("App.jsx: Login exitoso.");
    setIsLoggedIn(true);
    // Lee el rol del nuevo token guardado en localStorage
    const role = getRoleFromToken();
    setUserRole(role);
    console.log("App.jsx: Rol de usuario establecido a:", role);
    navigate('/'); // Redirige a inicio
  };

  // --- Manejador de Logout (MODIFICADO) ---
  const handleLogout = () => {
    console.log("App.jsx: Ejecutando handleLogout...");
    logout(); // Borra tokens desde el servicio
    setIsLoggedIn(false);
    setUserRole(null); // <-- Limpia el rol al hacer logout
    console.log("App.jsx: Estado actualizado a loggedIn=false, userRole=null.");
    // No necesitamos navigate aquí si ProtectedRoute maneja la redirección
    // navigate('/login');
  };

  return (
    <div className="app-container">

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />
        {/* --- Añade ruta para No Autorizado --- */}
        <Route path="/unauthorized" element={<Unauthorized />} />


        {/* --- RUTAS PROTEGIDAS con ROLES --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}> {/* Administrador y Promotor pueden ver Inicio */}
              <BaseLayout> <Index isLoggedIn={isLoggedIn} handleLogout={handleLogout} /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}> {/* Administrador y Promotor */}
              <BaseLayout> <Clientes /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contratos"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador', 'Promotor']}> {/* Administrador y Promotor */}
              <BaseLayout> <Contratos /> </BaseLayout>
            </ProtectedRoute>
          }
        />

        {/* --- Rutas solo para Administrador --- */}
        <Route
          path="/canales"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}> {/* SOLO Administrador */}
              <BaseLayout> <Canales /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}> {/* SOLO Administrador */}
              <BaseLayout> <Categorias /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/paquetes"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}> {/* SOLO Administrador */}
              <BaseLayout> <Paquetes /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bitacora"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}> {/* SOLO Administrador */}
              <BaseLayout> <Bitacora /> </BaseLayout>
            </ProtectedRoute>
          }
        />
        {/* Si tienes un CRUD de usuarios, iría aquí solo para Administrador */}
        {/* <Route path="/admin/usuarios" element={<ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['Administrador']}> <UserAdminCRUD /> </ProtectedRoute>} /> */}


        {/* Rutas de Error */}
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