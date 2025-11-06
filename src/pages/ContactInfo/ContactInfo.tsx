import React from "react";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from "react-icons/fi";
import "./ContactInfo.css";

const ContactInfo: React.FC = () => {
  const contactData = {
    address: {
      street: "Rua Exemplo, 123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
    phone: {
      primary: "(11) 1234-5678",
      secondary: "(11) 9876-5432",
      whatsapp: "(11) 98765-4321",
    },
    email: {
      primary: "contato@dolphinfast.com.br",
      support: "suporte@dolphinfast.com.br",
    },
    hours: {
      weekdays: "Segunda a Sexta: 08:00 - 18:00",
      saturday: "Sábado: 08:00 - 14:00",
      sunday: "Domingo: Fechado",
    },
    social: {
      facebook: "https://facebook.com/dolphinfast",
      instagram: "https://instagram.com/dolphinfast",
      twitter: "https://twitter.com/dolphinfast",
    },
  };

  return (
    <div className="contact-info-page">
      <div className="contact-info-header">
        <h1 className="contact-info-title">Informações de Contato</h1>
        <p className="contact-info-subtitle">
          Entre em contato conosco através dos canais abaixo
        </p>
      </div>

      <div className="contact-info-content">
        <div className="contact-info-card">
          <div className="contact-info-card-header">
            <FiMapPin size={24} className="contact-info-icon" />
            <h2 className="contact-info-card-title">Endereço</h2>
          </div>
          <div className="contact-info-card-body">
            <p className="contact-info-text">{contactData.address.street}</p>
            <p className="contact-info-text">
              {contactData.address.neighborhood}
            </p>
            <p className="contact-info-text">
              {contactData.address.city} - {contactData.address.state}
            </p>
            <p className="contact-info-text">CEP: {contactData.address.zipCode}</p>
          </div>
        </div>

        <div className="contact-info-card">
          <div className="contact-info-card-header">
            <FiPhone size={24} className="contact-info-icon" />
            <h2 className="contact-info-card-title">Telefones</h2>
          </div>
          <div className="contact-info-card-body">
            <div className="contact-info-item">
              <span className="contact-info-label">Principal:</span>
              <a href={`tel:${contactData.phone.primary}`} className="contact-info-link">
                {contactData.phone.primary}
              </a>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-label">Secundário:</span>
              <a href={`tel:${contactData.phone.secondary}`} className="contact-info-link">
                {contactData.phone.secondary}
              </a>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-label">WhatsApp:</span>
              <a
                href={`https://wa.me/${contactData.phone.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-link contact-info-whatsapp"
              >
                {contactData.phone.whatsapp}
              </a>
            </div>
          </div>
        </div>

        <div className="contact-info-card">
          <div className="contact-info-card-header">
            <FiMail size={24} className="contact-info-icon" />
            <h2 className="contact-info-card-title">E-mail</h2>
          </div>
          <div className="contact-info-card-body">
            <div className="contact-info-item">
              <span className="contact-info-label">Contato:</span>
              <a
                href={`mailto:${contactData.email.primary}`}
                className="contact-info-link"
              >
                {contactData.email.primary}
              </a>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-label">Suporte:</span>
              <a
                href={`mailto:${contactData.email.support}`}
                className="contact-info-link"
              >
                {contactData.email.support}
              </a>
            </div>
          </div>
        </div>

        <div className="contact-info-card">
          <div className="contact-info-card-header">
            <FiClock size={24} className="contact-info-icon" />
            <h2 className="contact-info-card-title">Horário de Funcionamento</h2>
          </div>
          <div className="contact-info-card-body">
            <p className="contact-info-text">{contactData.hours.weekdays}</p>
            <p className="contact-info-text">{contactData.hours.saturday}</p>
            <p className="contact-info-text">{contactData.hours.sunday}</p>
          </div>
        </div>

        <div className="contact-info-card contact-info-social">
          <div className="contact-info-card-header">
            <h2 className="contact-info-card-title">Redes Sociais</h2>
          </div>
          <div className="contact-info-card-body">
            <div className="contact-info-social-links">
              <a
                href={contactData.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-social-link"
              >
                <FiFacebook size={24} />
                <span>Facebook</span>
              </a>
              <a
                href={contactData.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-social-link"
              >
                <FiInstagram size={24} />
                <span>Instagram</span>
              </a>
              <a
                href={contactData.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-social-link"
              >
                <FiTwitter size={24} />
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

