import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX } from "react-icons/fi";
import "./Profile.css";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implementar atualização no Firebase
      console.log("Salvando dados:", formData);
      setIsEditing(false);
      // await updateUserProfile(formData);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">Meu Perfil</h1>
        <p className="profile-subtitle">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              <FiUser size={48} />
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button
                  className="profile-edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 size={18} />
                  Editar Perfil
                </button>
              ) : (
                <div className="profile-edit-actions">
                  <button
                    className="profile-save-button"
                    onClick={handleSave}
                  >
                    <FiSave size={18} />
                    Salvar
                  </button>
                  <button
                    className="profile-cancel-button"
                    onClick={handleCancel}
                  >
                    <FiX size={18} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-form">
            <div className="profile-field">
              <label htmlFor="name" className="profile-label">
                <FiUser className="profile-label-icon" />
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Digite seu nome completo"
                />
              ) : (
                <div className="profile-value">{user?.name || "Não informado"}</div>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="email" className="profile-label">
                <FiMail className="profile-label-icon" />
                Email
              </label>
              {isEditing ? (
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Digite seu email"
                  disabled
                />
              ) : (
                <div className="profile-value">{user?.email || "Não informado"}</div>
              )}
              {isEditing && (
                <p className="profile-field-hint">
                  O email não pode ser alterado
                </p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="phone" className="profile-label">
                <FiPhone className="profile-label-icon" />
                Telefone
              </label>
              {isEditing ? (
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Digite seu telefone"
                />
              ) : (
                <div className="profile-value">
                  {user?.phone || "Não informado"}
                </div>
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label">
                <FiUser className="profile-label-icon" />
                Tipo de Usuário
              </label>
              <div className="profile-value profile-role">
                {user?.role === "admin" && "Administrador"}
                {user?.role === "gerente" && "Gerente"}
                {user?.role === "caixa" && "Caixa"}
                {user?.role === "lavador" && "Lavador"}
                {user?.role === "user" && "Cliente"}
                {!user?.role && "Não definido"}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card-title">Informações da Conta</h2>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Data de Cadastro</span>
              <span className="profile-info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                  : "Não disponível"}
              </span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Último Acesso</span>
              <span className="profile-info-value">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString("pt-BR")
                  : "Não disponível"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

