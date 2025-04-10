import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignOutAlt, FaBackward } from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    };

    return (
        <>
            <header className="top-navbar">
                <div className="logo">SIGIPT</div>
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> <span>Cerrar sesión</span>
                </button>
            </header>

            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '←' : '→'}
                </button>
                
                <nav className="nav-links">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <AiFillHome /> <span>Inicio</span>
                    </Link>
                    <Link to="/canales" className={`nav-link ${location.pathname === '/canales' ? 'active' : ''}`}>
                        <MdTv /> <span>Canales</span>
                    </Link>
                    <Link to="/categorias" className={`nav-link ${location.pathname === '/categorias' ? 'active' : ''}`}>
                        <BiCategory /> <span>Categorías</span>
                    </Link>
                    <Link to="/paquetes" className={`nav-link ${location.pathname === '/paquetes' ? 'active' : ''}`}>
                        <FaBox /> <span>Paquetes</span>
                    </Link>
                    <Link to="/clientes" className={`nav-link ${location.pathname === '/clientes' ? 'active' : ''}`}>
                        <FaUsers /> <span>Clientes</span>
                    </Link>
                    <Link to="/contratos" className={`nav-link ${location.pathname === '/contratos' ? 'active' : ''}`}>
                        <FaFileContract /> <span>Contratos</span>
                    </Link>
                    <Link to="/bitacora" className={`nav-link ${location.pathname === '/bitacora'? 'active' : ''}`}>
                        <FaBackward /> <span>Bitácora</span>
                    </Link>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
