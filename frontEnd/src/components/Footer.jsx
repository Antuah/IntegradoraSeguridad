import React from 'react';
import '../styles/Footer.css';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>SIGIPT</h3>
                    <p>Brindando los mejores servicios de telecomunicaciones para tu hogar y negocio.</p>
                </div>
                
                <div className="footer-section">
                    <h3>Contacto</h3>
                    <div className="contact-info">
                        <p><FaPhone /> (123) 456-7890</p>
                        <p><FaEnvelope /> contacto@sigipt.com</p>
                        <p><FaMapMarkerAlt /> Av. Principal #123, Ciudad</p>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Síguenos</h3>
                    <div className="social-links">
                        <a href="#"><FaFacebook /></a>
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaInstagram /></a>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>© 2024 SIGIPT - Todos los derechos reservados</p>
            </div>
        </footer>
    );
};

export default Footer;
