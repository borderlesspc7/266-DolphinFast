import React from "react";
import "./PartnersSection.css";

export const PartnersSection: React.FC = () => {
  return (
    <div className="partners-section">
      <div className="partners-container">
        <div className="partners-logos">
          {/* Globo Logo */}
          <div className="partner-logo">
            <div className="logo-globo">
              <div className="globo-icon">
                <div className="globo-circle-outer"></div>
                <div className="globo-circle-inner"></div>
                <div className="globo-square"></div>
              </div>
              <span className="logo-text">globo</span>
            </div>
          </div>

          {/* Estapar Logo */}
          <div className="partner-logo">
            <div className="logo-estapar">
              <div className="estapar-icon">
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <path
                    d="M22.5 10L35 22.5H28V35H17V22.5H10L22.5 10Z"
                    fill="#000"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span className="logo-text">ESTAPAR</span>
            </div>
          </div>

          {/* Maxipark Logo */}
          <div className="partner-logo">
            <div className="logo-maxipark">
              <div className="maxipark-icon">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <path
                    d="M10 10L25 5L40 10V25L25 30L10 25V10Z"
                    fill="#000"
                  />
                  <path
                    d="M25 15L32.5 11.25V18.75L25 22.5L17.5 18.75V11.25L25 15Z"
                    fill="#fff"
                  />
                </svg>
              </div>
              <span className="logo-text">MAXIPARK</span>
            </div>
          </div>

          {/* GAD Logo */}
          <div className="partner-logo">
            <div className="logo-gad">
              <div className="gad-icon">
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none">
                  <path
                    d="M6 6H18V13H12V19H18V26H6V6Z"
                    fill="#000"
                  />
                  <path
                    d="M22 6H28V18H34V6H40V26H22V6Z"
                    fill="#000"
                  />
                  <path
                    d="M46 6H56V13H51V15.5H56V20.5H51V26H46V6Z"
                    fill="#000"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Estudio Car Detalhamento Emblem */}
          <div className="partner-logo">
            <div className="logo-estudio">
              <div className="estudio-emblem">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                  <circle cx="35" cy="35" r="32" stroke="#000" strokeWidth="2.5" />
                  <text x="35" y="22" textAnchor="middle" fontSize="7" fill="#000" fontWeight="700" letterSpacing="0.5">ESTUDIO CAR</text>
                  <text x="32" y="25" fontSize="4" fill="#000">★</text>
                  <text x="38" y="25" fontSize="4" fill="#000">★</text>
                  <text x="35" y="58" textAnchor="middle" fontSize="7" fill="#000" fontWeight="700" letterSpacing="0.5">DETALHAMENTO</text>
                  {/* Car grille */}
                  <rect x="22" y="28" width="26" height="14" rx="2" fill="#000" opacity="0.4" />
                  <rect x="24" y="30" width="6" height="10" rx="1" fill="#fff" />
                  <rect x="32" y="30" width="6" height="10" rx="1" fill="#fff" />
                  <rect x="40" y="30" width="6" height="10" rx="1" fill="#fff" />
                  {/* Headlights */}
                  <circle cx="18" cy="35" r="5" fill="#000" opacity="0.6" />
                  <circle cx="52" cy="35" r="5" fill="#000" opacity="0.6" />
                  {/* Decorative wings */}
                  <path d="M12 35 Q8 32, 8 28 Q8 24, 12 25" stroke="#000" strokeWidth="1.5" fill="none" />
                  <path d="M58 35 Q62 32, 62 28 Q62 24, 58 25" stroke="#000" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

