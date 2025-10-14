import { FiAlertTriangle, FiClock, FiCalendar } from "react-icons/fi";
import "./AlertsSection.css";

export const AlertsSection = () => {
  const alerts = [
    {
      type: "warning",
      icon: FiAlertTriangle,
      title: "Estoque Baixo",
      description: "Produto X está com apenas 5 unidades restantes",
      time: "2 horas atrás",
      color: "#f59e0b",
    },
    {
      type: "error",
      icon: FiClock,
      title: "Funcionários Atrasados",
      description: "João Silva ainda não registrou entrada",
      time: "1 hora atrás",
      color: "#ef4444",
    },
    {
      type: "info",
      icon: FiCalendar,
      title: "Planos a Vencer",
      description: "3 planos de lavagem vencem nos próximos 7 dias",
      time: "30 min atrás",
      color: "#3b82f6",
    },
  ];

  return (
    <div className="alerts-section">
      <h2 className="section-title">Alertas</h2>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.type}`}>
            <div
              className="alert-icon"
              style={{ backgroundColor: `${alert.color}15` }}
            >
              <alert.icon size={20} style={{ color: alert.color }} />
            </div>
            <div className="alert-content">
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-description">{alert.description}</p>
              <span className="alert-time">{alert.time}</span>
            </div>
            <div className="alert-actions">
              <button className="alert-button">Ver</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
