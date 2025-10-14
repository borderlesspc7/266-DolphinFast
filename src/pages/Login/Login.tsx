import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import { paths } from "../../routes/paths";
import type { LoginCredentials } from "../../types/user";
import "./Login.css";
import { FiArrowRight } from "react-icons/fi";

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginCredentials) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login(formData);
      navigate(paths.dashboard);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-form-card">
          <div className="login-header">
            <p className="login-title">Bem-vindo de volta</p>
            <p className="login-subtitle">
              Entre com suas credenciais para continuar
            </p>
            <button onClick={() => navigate(paths.dashboard)}>
              <FiArrowRight />
            </button>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={handleInputChange}
                className="login-input"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Senha
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="login-input"
              />
            </div>

            <div className="login-buttons">
              <Button
                type="submit"
                variant="primary"
                className="login-button"
                size="large"
                disabled={loading || !formData.email || !formData.password}
              >
                Entrar
              </Button>
            </div>

            <div className="login-footer">
              <span className="login-footer-text">
                Não tem uma conta? {""}
                <Link to={paths.register} className="login-footer-link">
                  Cadastre-se
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
