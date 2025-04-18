import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paquetesApi } from '../services/api';
import '../styles/Index.css';
import { AiFillHome } from 'react-icons/ai';
import { BiCategory } from 'react-icons/bi';
import { MdTv, MdSpeed, MdDevices } from 'react-icons/md';
import { FaBox, FaUsers, FaFileContract, FaSignInAlt, FaWifi } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import customPlansImage from '../assets/img/internet.jpg';
import entertainmentImage from '../assets/img/entertainment.jpg';


function Index() {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);

  useEffect(() => {
    loadPaquetes();
  }, []);

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      void error;
    }
  };

  return (
    <div className="index-container">
    
        <section className="hero-section">
          <Carousel 
            autoPlay 
            infiniteLoop 
            showStatus={false} 
            showThumbs={false}
            interval={5000}
            showArrows={true}
            dynamicHeight={false}
            swipeable={true}
            emulateTouch={true}
            className="main-carousel"
          >
            <div className="carousel-slide">
              <img src={customPlansImage} alt="Internet Services" />
              <div className="carousel-content" style={{ textAlign: 'center', width: '100%' }}>
                <h2>Internet de Alta Velocidad</h2>
                <p>Conexión ultrarrápida para toda tu familia</p>
              </div>
            </div>
            <div className="carousel-slide">
              <img src={entertainmentImage} alt="Entertainment" />
              <div className="carousel-content" style={{ textAlign: 'center', width: '100%' }}>
                <h2>Entretenimiento Premium</h2>
                <p>Los mejores canales y plataformas de streaming</p>
              </div>
            </div>
            
            <div className="carousel-slide">
              
              <img 
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Custom Plans" 
              />
              <div className="carousel-content" style={{ textAlign: 'center', width: '100%' }}>
                <h2>Los mejores planes</h2>
                <p>Encuentra el plan perfecto para ti</p>
              </div>
            </div>
          </Carousel>
        </section>

        <section className="packages-section">
          <h2>Paquetes Destacados</h2>
          <div className="feature-cards-container">
            {paquetes.slice(0, 3).map((paquete) => (
              <div key={paquete.id} className="feature-card package-feature-card">
                <div className="feature-image-container">
                  <img 
                    src={`https://source.unsplash.com/random/300x200/?internet,${paquete.id}`}
                    alt={paquete.nombre} 
                    className="feature-image"
                  />
                </div>
                <h3>{paquete.nombre}</h3>
                <div className="package-price">
                  <span className="currency">$</span>
                  <span className="amount">{paquete.precio}</span>
                  <span className="period">/mes</span>
                </div>
                <p className="package-features-text">
                  <span className="feature-detail"><MdSpeed className="inline-icon" /> {paquete.velocidad_internet}</span>
                  <span className="feature-detail"><MdTv className="inline-icon" /> {paquete.canales.length}+ canales</span>
                </p>
                <button className="feature-button" onClick={() => navigate('/contratos')}>
                  Contratar Ahora
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-cards-section">
          <div className="feature-cards-container">
            <div className="feature-card">
              <div className="feature-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lmaXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Internet de Alta Velocidad" 
                  className="feature-image"
                />
              </div>
              <h3>Internet de Alta Velocidad</h3>
              <p>Navega sin límites con nuestra conexión de fibra óptica de última generación.</p>
              <button className="feature-button" onClick={() => navigate('/paquetes')}>
                Ver planes
              </button>
            </div>
            
            <div className="feature-card">
              <div className="feature-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHYlMjBlbnRlcnRhaW5tZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Televisión Premium" 
                  className="feature-image"
                />
              </div>
              <h3>Los mejores canales</h3>
              <p>Disfruta de más de 200 canales HD y contenido exclusivo para toda la familia.</p>
              <button className="feature-button" onClick={() => navigate('/paquetes')}>
                Explorar canales
              </button>
            </div>
            
            <div className="feature-card">
              <div className="feature-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1507646227500-4d389b0012be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGV2aWNlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Múltiples Dispositivos" 
                  className="feature-image"
                />
              </div>
              <h3>Múltiples Dispositivos</h3>
              <p>Conecta todos tus dispositivos simultáneamente sin perder velocidad.</p>
              <button className="feature-button" onClick={() => navigate('/paquetes')}>
                Más información
              </button>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-content">
            <h2>Acerca de Nosotros</h2>
            <p>
              En SIGIPT, nos dedicamos a proporcionar servicios de telecomunicaciones 
              de alta calidad. Con más de 10 años de experiencia, ofrecemos soluciones 
              integrales de internet y televisión que se adaptan a las necesidades de 
              cada cliente.
            </p>
            <div className="about-features">
              <div className="feature">
                <h3>Cobertura Nacional</h3>
                <p>Presentes en las principales ciudades del país</p>
              </div>
              <div className="feature">
                <h3>Soporte 24/7</h3>
                <p>Asistencia técnica disponible todo el día</p>
              </div>
              <div className="feature">
                <h3>Tecnología de Punta</h3>
                <p>Equipamiento y servicios de última generación</p>
              </div>
            </div>
          </div>
        </section>
      
    </div>
  );
}

export default Index;
