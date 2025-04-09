import React, { useState } from 'react';
import user from '../assets/user.svg';
import contract from '../assets/contract.svg';
import packages from '../assets/packages.svg';
import tags from '../assets/tags.svg';
import canals from '../assets/canals.svg';

const Sidebar = ({ onSelectComponent, activeComponent }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Clientes', component: 'Clientes', icon: user },
    { name: 'Contratos', component: 'Contratos', icon: contract },
    { name: 'Paquetes', component: 'Paquetes', icon: packages },
    { name: 'Categorías', component: 'Categorias', icon: tags },
    { name: 'Canales', component: 'Canales', icon: canals },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div
      className={`border-end bg-light ${collapsed ? 'p-2' : 'p-3'} d-flex flex-column align-items-${collapsed ? 'center' : 'start'}`}
      style={{ minHeight: '100vh', width: collapsed ? '60px' : '200px', transition: 'width 0.3s' }}
    >
      <button 
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={toggleSidebar}
        title={collapsed ? 'Abrir menú' : 'Cerrar menú'}
      >
        ☰
      </button>

      <ul className="nav nav-pills flex-column w-100 gap-1">
        {menuItems.map(item => (
          <li className="nav-item" key={item.name}>
            <button
              className={`nav-link d-flex align-items-center gap-2 ${
                activeComponent === item.component ? 'active bg-primary text-white' : 'text-dark'
              }`}
              onClick={() => onSelectComponent(item.component)}
              title={collapsed ? item.name : undefined}
            >
              <img src={item.icon} alt={item.name} style={{ width: '20px', height: '20px' }} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;