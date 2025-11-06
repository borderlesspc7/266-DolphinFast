import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiArrowRight, FiCheck } from "react-icons/fi";
import { paths } from "../../routes/paths";
import "./HeroSection.css";

export const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-container">
        {/* Header */}
        <header className="hero-header">
          <div className="hero-logo">
            <div className="logo-icon"></div>
            <span className="logo-text">Dolphinfast</span>
          </div>
          <Link to={paths.login} className="hero-login-button">
            <FiUser size={16} />
            Entrar
          </Link>
        </header>

        {/* Main Content */}
        <div className="hero-content">
          {/* Left Section */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span className="badge-text">SISTEMA DE GESTÃO COM IA</span>
            </div>

            <h1 className="hero-headline">
              Aceleramos seu <span className="highlight">negócio automotivo</span> pra você faturar{" "}
              <span className="highlight">mais.</span>
            </h1>

            <p className="hero-description">
              Sem complicação e fácil de usar. A Dolphinfast ajuda estéticas automotivas, valets e estacionamentos a terem mais velocidade na gestão, 24 horas por dia.
            </p>

            <div className="hero-cta">
              <button className="cta-button">
                Quero velocidade na gestão
                <FiArrowRight size={20} />
              </button>
              <p className="cta-subtext">
                Te atendemos em menos de 1 minuto.
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="hero-right">
            <div className="hero-visual-wrapper">
              {/* Decorative Blue Shape */}
              <div className="blue-accent-shape"></div>

              {/* Decorative Dots */}
              <div className="decorative-dots">
                <span className="dot"></span>
                <span className="dot"></span>
              </div>

              {/* Visual Cards */}
              <div className="visual-cards">
                <div className="visual-card card-left">
                  <div className="card-image people-card">
                    <div className="people-scene">
                      <div className="person person-1">
                        <div className="person-avatar"></div>
                      </div>
                      <div className="person person-2">
                        <div className="person-avatar"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="visual-card card-right">
                  <div className="card-image car-card">
                    <div className="car-scene">
                      <div className="car-polish">
                        <div className="polish-person">
                          <div className="polish-avatar"></div>
                        </div>
                        <div className="car-silhouette"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Bubbles */}
              <div className="chat-bubble chat-1">
                <div className="chat-icon">
                  <div className="icon-circle"></div>
                </div>
                <div className="chat-content">
                  <span className="chat-text">Dolphin AI, quanto vendi esse mês?</span>
                  <FiArrowRight size={14} className="chat-arrow" />
                </div>
              </div>

              <div className="chat-bubble chat-2">
                <div className="chat-icon check-icon">
                  <FiCheck size={14} />
                </div>
                <div className="chat-content">
                  <span className="chat-text">Mensalista cadastrado.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

