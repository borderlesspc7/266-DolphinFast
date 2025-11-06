import { Link, useLocation, useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";
import { useAuth } from "../../../hooks/useAuth";
import { isEmployee } from "../../../types/user";
import {
  FiUsers,
  FiShoppingCart,
  FiPhone,
  FiCreditCard,
  FiUserCheck,
  FiPackage,
  FiTruck,
  FiShield,
  FiBarChart,
  FiLogOut,
  FiClock,
  FiUser,
  FiInfo,
} from "react-icons/fi";
import "./Sidebar.css";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, loading, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.landing);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Todos os itens do menu
  const allMenuItems = [
    { path: paths.dashboard, label: "Dashboard", icon: FiBarChart, employeeOnly: true },
    { path: paths.areaCliente, label: "Área do Cliente", icon: FiUsers, employeeOnly: true },
    { path: paths.pdv, label: "PDV", icon: FiShoppingCart, employeeOnly: true },
    { path: paths.crm, label: "CRM", icon: FiPhone, employeeOnly: true },
    {
      path: paths.gestaoFinanceira,
      label: "Gestão Financeira e Contábil",
      icon: FiCreditCard,
      employeeOnly: true,
    },
    {
      path: paths.recursosHumanos,
      label: "Recursos Humanos e Ponto",
      icon: FiUserCheck,
      employeeOnly: true,
    },
    { path: paths.estoque, label: "Estoque", icon: FiPackage, employeeOnly: true },
    { path: paths.planosLavagem, label: "Planos de Lavagem", icon: FiTruck, employeeOnly: true },
    { path: paths.seguranca, label: "Segurança e Backups", icon: FiShield, employeeOnly: true },
    { path: paths.history, label: "Histórico de Compras e Serviços", icon: FiClock, employeeOnly: false },
    { path: paths.profile, label: "Perfil", icon: FiUser, employeeOnly: false },
    { path: paths.contactInfo, label: "Informações de Contato", icon: FiInfo, employeeOnly: false },
  ];

  // Filtrar itens baseado no role do usuário
  const menuItems = allMenuItems.filter((item) => {
    // Se for cliente (user), só mostra itens não exclusivos para funcionários
    if (!isEmployee(user?.role)) {
      return !item.employeeOnly;
    }
    // Se for funcionário, mostra tudo
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">DolphinFast</h2>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <Link
                to={item.path}
                className={`sidebar-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="sidebar-icon">
                  <item.icon size={20} />
                </span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="sidebar-logout-button"
        >
          <span className="sidebar-icon">
            <FiLogOut size={20} />
          </span>
          <span className="sidebar-label">Sair</span>
        </button>
      </div>
    </aside>
  );
};
