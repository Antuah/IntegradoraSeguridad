import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Clientes', path: '/clientes' },
    { name: 'Contratos', path: '/contratos' },
    { name: 'Paquetes', path: '/paquetes' },
    { name: 'Categorías', path: '/categorias' },
    { name: 'Canales', path: '/canales' },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`border-end bg-light ${collapsed ? 'p-2' : 'p-3'} d-flex flex-column`} style={{ minHeight: '100vh', width: collapsed ? '60px' : '200px' }}>
      <button 
        className="btn btn-outline-secondary mb-3"
        onClick={toggleSidebar}
      >
        {collapsed ? '☰' : '✖'}
      </button>

      {!collapsed && (
        <ul className="nav nav-pills flex-column">
          {menuItems.map(item => (
            <li className="nav-item" key={item.name}>
              <button
                className={`nav-link text-start ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
