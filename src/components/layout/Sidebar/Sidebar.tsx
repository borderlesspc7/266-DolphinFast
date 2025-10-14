import { Link, useLocation } from "react-router-dom";
import { paths } from "../../../routes/paths";
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
} from "react-icons/fi";
import "./Sidebar.css";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: paths.dashboard, label: "Dashboard", icon: FiBarChart },
    { path: paths.areaCliente, label: "Área do Cliente", icon: FiUsers },
    { path: paths.pdv, label: "PDV", icon: FiShoppingCart },
    { path: paths.crm, label: "CRM", icon: FiPhone },
    {
      path: paths.gestaoFinanceira,
      label: "Gestão Financeira e Contábil",
      icon: FiCreditCard,
    },
    {
      path: paths.recursosHumanos,
      label: "Recursos Humanos e Ponto",
      icon: FiUserCheck,
    },
    { path: paths.estoque, label: "Estoque", icon: FiPackage },
    { path: paths.planosLavagem, label: "Planos de Lavagem", icon: FiTruck },
    { path: paths.seguranca, label: "Segurança e Backups", icon: FiShield },
  ];

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
    </aside>
  );
};
