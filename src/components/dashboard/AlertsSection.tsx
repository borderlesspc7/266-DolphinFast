import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiClock, FiCalendar } from "react-icons/fi";
import { getStockAlerts } from "../../services/estoqueService";
import { getLateEmployees } from "../../services/rhService";
import { getExpiringPromotions } from "../../services/crmService";
import { getProduct } from "../../services/estoqueService";
import { paths } from "../../routes/paths";
import "./AlertsSection.css";

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  icon: typeof FiAlertTriangle;
  title: string;
  description: string;
  time: string;
  color: string;
  actionId?: string;
  actionType?: "stock" | "employee" | "promotion";
}

export const AlertsSection = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const [stockAlerts, lateEmployees, expiringPromotions] =
          await Promise.all([
            getStockAlerts("active"),
            getLateEmployees(),
            getExpiringPromotions(7),
          ]);

        const alertsList: Alert[] = [];

        // Alertas de estoque
        for (const stockAlert of stockAlerts.slice(0, 5)) {
          try {
            const product = await getProduct(stockAlert.productId);
            if (product) {
              const timeAgo = getTimeAgo(stockAlert.createdAt);
              alertsList.push({
                id: stockAlert.id,
                type: stockAlert.priority === "critical" ? "error" : "warning",
                icon: FiAlertTriangle,
                title: "Estoque Baixo",
                description: `${product.name} está com apenas ${product.currentStock} unidades restantes (mínimo: ${product.minStock})`,
                time: timeAgo,
                color: stockAlert.priority === "critical" ? "#ef4444" : "#f59e0b",
                actionId: stockAlert.id,
                actionType: "stock",
              });
            }
          } catch (err) {
            console.error("Erro ao buscar produto do alerta:", err);
          }
        }

        // Alertas de funcionários atrasados
        for (const employee of lateEmployees.slice(0, 5)) {
          const timeAgo = "Hoje";
          alertsList.push({
            id: `employee-${employee.employeeId}`,
            type: employee.status === "absent" ? "error" : "warning",
            icon: FiClock,
            title:
              employee.status === "absent"
                ? "Funcionário Ausente"
                : "Funcionário Atrasado",
            description: `${employee.employeeName} ${
              employee.status === "absent"
                ? "não registrou entrada"
                : `registrou entrada às ${employee.clockInTime} (esperado: ${employee.expectedTime})`
            }`,
            time: timeAgo,
            color: employee.status === "absent" ? "#ef4444" : "#f59e0b",
            actionId: employee.employeeId,
            actionType: "employee",
          });
        }

        // Alertas de promoções a vencer
        for (const promotion of expiringPromotions.slice(0, 3)) {
          const validUntil = new Date(promotion.validUntil);
          const daysUntilExpiry = Math.ceil(
            (validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const timeAgo = daysUntilExpiry === 0 ? "Hoje" : `${daysUntilExpiry} dias`;
          alertsList.push({
            id: promotion.id,
            type: "info",
            icon: FiCalendar,
            title: "Promoção a Vencer",
            description: `${promotion.title} vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? "s" : ""}`,
            time: timeAgo,
            color: "#3b82f6",
            actionId: promotion.id,
            actionType: "promotion",
          });
        }

        // Ordenar por prioridade (error > warning > info) e depois por tempo
        alertsList.sort((a, b) => {
          const priorityOrder = { error: 0, warning: 1, info: 2 };
          const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
          if (priorityDiff !== 0) return priorityDiff;
          return 0;
        });

        setAlerts(alertsList);
      } catch (err) {
        console.error("Erro ao buscar alertas:", err);
        setError("Erro ao carregar alertas");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Atualizar alertas a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? "s" : ""} atrás`;
    return `${diffDays} dia${diffDays !== 1 ? "s" : ""} atrás`;
  };

  const handleViewAlert = (alert: Alert) => {
    // Navegar para a seção apropriada baseado no tipo
    if (alert.actionType === "stock") {
      navigate(paths.estoque);
    } else if (alert.actionType === "employee") {
      navigate(paths.recursosHumanos);
    } else if (alert.actionType === "promotion") {
      navigate(paths.crm);
    }
  };

  if (loading) {
    return (
      <div className="alerts-section">
        <h2 className="section-title">Alertas</h2>
        <div className="alerts-loading">
          <p>Carregando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-section">
        <h2 className="section-title">Alertas</h2>
        <div className="alerts-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-section">
      <h2 className="section-title">Alertas</h2>
      {alerts.length === 0 ? (
        <div className="alerts-empty">
          <p>Nenhum alerta no momento</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
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
                <button
                  className="alert-button"
                  onClick={() => handleViewAlert(alert)}
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
