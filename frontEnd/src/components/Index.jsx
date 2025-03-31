import { useState } from 'react';
import '../styles/Index.css';

function Index() {
  const [currentSection, setCurrentSection] = useState('home');

  const internetPackages = [
    {
      name: "Plan Básico",
      speed: "50 Mbps",
      price: "$29.99",
      channels: "60+ Canales",
      features: [
        "Datos Ilimitados",
        "Seguridad Básica",
        "Soporte 24/7",
        "Canales HD",
        "TNT, ESPN, Disney Channel"
      ]
    },
    {
      name: "Plan Premium",
      speed: "200 Mbps",
      price: "$49.99",
      channels: "120+ Canales",
      features: [
        "Datos Ilimitados",
        "Seguridad Avanzada",
        "Soporte Prioritario",
        "IP Estática",
        "Canales HD y Full HD",
        "HBO, FOX Sports, Discovery"
      ]
    },
    {
      name: "Plan Empresarial",
      speed: "500 Mbps",
      price: "$99.99",
      channels: "200+ Canales",
      features: [
        "Datos Ilimitados",
        "Seguridad Empresarial",
        "Soporte Dedicado",
        "Múltiples IPs Estáticas",
        "Garantía de Servicio",
        "Todos los canales Premium",
        "Paquete Deportivo Completo"
      ]
    }
  ];

  return (
    <div className="index-container">
      <nav className="navbar">
        <div className="logo">SIGIPT</div>
        <div className="nav-links">
          <button onClick={() => setCurrentSection('home')} className={currentSection === 'home' ? 'active' : ''}>
            Inicio
          </button>
          <button onClick={() => setCurrentSection('packages')} className={currentSection === 'packages' ? 'active' : ''}>
            Paquetes
          </button>
          <button onClick={() => setCurrentSection('support')} className={currentSection === 'support' ? 'active' : ''}>
            Soporte
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className="dashboard-header">
          <h1>Paquetes de Internet + TV</h1>
          <p>Elige el plan perfecto para tus necesidades</p>
        </section>

        <section className="packages-grid">
          {internetPackages.map((pkg, index) => (
            <div key={index} className="package-card">
              <div className="package-header">
                <h3>{pkg.name}</h3>
                <div className="package-price">{pkg.price}<span>/mes</span></div>
              </div>
              <div className="package-speed">
                <span className="speed-value">{pkg.speed}</span>
                <span className="speed-label">Velocidad de Internet</span>
              </div>
              <div className="package-channels">
                <span className="channels-value">{pkg.channels}</span>
                <span className="channels-label">Televisión Digital</span>
              </div>
              <ul className="package-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button className="subscribe-button">Contratar Ahora</button>
            </div>
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>© 2024 SIGIPT - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Index;
