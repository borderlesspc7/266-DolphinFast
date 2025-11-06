import { FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { getRoleLabel } from "../../../types/user";
import "./Header.css";

export const Header = () => {
  const { user } = useAuth();

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
              <span className="user-name">{user?.name || "Usuário"}</span>
              <span className="user-role">{getRoleLabel(user?.role)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
