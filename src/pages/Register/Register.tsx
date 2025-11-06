import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import type { RegisterCredentials } from "../../types/user";
import "./Register.css";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "user", // Sempre registra como cliente
  });
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.name
    ) {
      return "Todos os campos são obrigatórios";
    }

    if (formData.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      //Implementar toast
      alert(validationError);
      return;
    }

    try {
      // Sempre registra como cliente (user)
      const registerData = {
        ...formData,
        role: "user" as const,
      };
      await register(registerData);
      // Clientes sempre são redirecionados para o perfil após registro
      navigate(paths.profile);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-form-card">
          <div className="register-header">
            <p className="register-title">Criar conta</p>
            <p className="register-subtitle">
              Preencha os campos abaixo para criar sua conta
            </p>
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="register-error">{error}</div>}

            <div className="register-field">
              <label htmlFor="name" className="register-label">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="register-input"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="register-field">
              <label htmlFor="email" className="register-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="register-input"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div className="register-field">
              <label htmlFor="phone" className="register-label">
                Telefone (Opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="register-input"
                placeholder="Digite seu telefone"
              />
            </div>

            <div className="register-field">
              <label htmlFor="password" className="register-label">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="register-input"
                placeholder="Digite sua senha (mín. 6 caracteres)"
              />
            </div>

            <div className="register-buttons">
              <Button
                type="submit"
                size="large"
                disabled={
                  loading ||
                  !formData.email ||
                  !formData.password ||
                  !formData.name
                }
                className="register-button"
              >
                Cadastrar
              </Button>
            </div>

            <div className="register-footer">
              <span className="register-footer-text">
                Já tem uma conta? {""}
                <Link to={paths.login} className="register-footer-link">
                  Entrar
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
