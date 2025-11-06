import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter, FiMail, FiPhone } from "react-icons/fi";
import "./Footer.css";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Column */}
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <div className="logo-icon"></div>
              <span className="logo-text">Dolphinfast</span>
            </div>
            <p className="footer-description">
              Sistema de gestão com IA para acelerar seu negócio automotivo. 
              Mais velocidade, mais resultados.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-column">
            <h3 className="footer-title">Produtos</h3>
            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">CRM</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Estoque</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">RH</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Dashboard</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Empresa</h3>
            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">Sobre Nós</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Blog</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Carreiras</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Parceiros</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Suporte</h3>
            <ul className="footer-links">
              <li>
                <Link to="#" className="footer-link">Central de Ajuda</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Documentação</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Contato</Link>
              </li>
              <li>
                <Link to="#" className="footer-link">Política de Privacidade</Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-column">
            <h3 className="footer-title">Contato</h3>
            <ul className="footer-contact">
              <li className="contact-item">
                <FiMail size={18} className="contact-icon" />
                <a href="mailto:contato@dolphinfast.com" className="contact-link">
                  contato@dolphinfast.com
                </a>
              </li>
              <li className="contact-item">
                <FiPhone size={18} className="contact-icon" />
                <a href="tel:+5511999999999" className="contact-link">
                  (11) 99999-9999
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Dolphinfast. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

