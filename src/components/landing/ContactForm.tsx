import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import "./ContactForm.css";

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  isClient: "sim" | "nao" | "";
  businessSegment: string[];
  companyName: string;
  challenge: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    whatsapp: "",
    isClient: "",
    businessSegment: [],
    companyName: "",
    challenge: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isClient: e.target.value as "sim" | "nao",
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          businessSegment: [...prev.businessSegment, value],
        };
      } else {
        return {
          ...prev,
          businessSegment: prev.businessSegment.filter((item) => item !== value),
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
    // Aqui você pode adicionar a lógica para enviar os dados
  };

  return (
    <div className="contact-form-section">
      <div className="contact-form-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2 className="form-title">
            Preencha o formulário e fale agora com um especialista da Dolphinfast.
          </h2>

          <div className="form-field">
            <label htmlFor="name" className="field-label">
              Qual o seu nome?
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="field-label">
              Qual o seu e-mail?
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="whatsapp" className="field-label">
              Qual o seu whatsapp, com DDD?
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="form-input"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              Você já é cliente Dolphinfast?
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="isClient"
                  value="sim"
                  checked={formData.isClient === "sim"}
                  onChange={handleRadioChange}
                  className="radio-input"
                />
                <span className="radio-text">Sim</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="isClient"
                  value="nao"
                  checked={formData.isClient === "nao"}
                  onChange={handleRadioChange}
                  className="radio-input"
                />
                <span className="radio-text">Não</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">
              Qual é o segmento do seu negócio?
            </label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  value="estacionamento"
                  checked={formData.businessSegment.includes("estacionamento")}
                  onChange={handleCheckboxChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Estacionamento</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  value="valet"
                  checked={formData.businessSegment.includes("valet")}
                  onChange={handleCheckboxChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Valet</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  value="lava-rapido"
                  checked={formData.businessSegment.includes("lava-rapido")}
                  onChange={handleCheckboxChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Lava-Rápido</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  value="estetica-automotiva"
                  checked={formData.businessSegment.includes(
                    "estetica-automotiva"
                  )}
                  onChange={handleCheckboxChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Estética Automotiva</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="companyName" className="field-label">
              Qual o nome da sua empresa?
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge" className="field-label">
              Qual é o seu maior desafio com gestão?
            </label>
            <textarea
              id="challenge"
              name="challenge"
              value={formData.challenge}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
            />
          </div>

          <button type="submit" className="submit-button">
            Enviar para especialista
            <FiArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

