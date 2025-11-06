import React from "react";
import { FiArrowRight } from "react-icons/fi";
import "./AnnouncementSection.css";

export const AnnouncementSection: React.FC = () => {
  return (
    <div className="announcement-section">
      <div className="announcement-container">
        <div className="announcement-content">
          {/* Badge/Icon */}
          <div className="announcement-badge">
            <div className="badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 12L11 15L16 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="badge-text">• GESTÃO AUTOMOTIVA COM IA</span>
          </div>

          {/* Main Headline */}
          <h2 className="announcement-headline">
            Em breve um <span className="italic">novo site</span>.
          </h2>

          {/* Descriptive Paragraph */}
          <p className="announcement-description">
            A Dolphinfast tem novidades para acelerar sua gestão automotiva! Enquanto o novo site não chega, acesse a plataforma normalmente ou fale com nossos especialistas.
          </p>

          {/* CTA Button */}
          <button className="announcement-button">
            Quero velocidade na gestão
            <FiArrowRight size={20} />
          </button>

          {/* Subtext */}
          <p className="announcement-subtext">
            Te atendemos em menos de 1 minuto.
          </p>
        </div>
      </div>
    </div>
  );
};

