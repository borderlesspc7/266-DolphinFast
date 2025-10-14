import { FiBell, FiUser } from "react-icons/fi";
import "./Header.css";

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Sistema de Gestão</h1>
        </div>
        <div className="header-right">
          <button className="header-notification">
            <span className="notification-icon">
              <FiBell size={20} />
            </span>
            <span className="notification-badge">3</span>
          </button>
          <div className="header-user">
            <div className="user-avatar">
              <FiUser size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">Usuário</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
