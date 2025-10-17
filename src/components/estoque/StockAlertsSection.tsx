import React, { useState, useEffect, useCallback } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
} from "react-icons/fi";
import type { Product, StockAlert } from "../../types/estoque";
import "./StockAlertsSection.css";

interface StockAlertsSectionProps {
  products: Product[];
  alerts: StockAlert[];
  onLoadAlerts: (status?: "active" | "resolved" | "ignored") => Promise<void>;
  onUpdateAlertStatus: (
    id: string,
    status: "active" | "resolved" | "ignored"
  ) => Promise<void>;
}

const StockAlertsSection: React.FC<StockAlertsSectionProps> = ({
  products,
  alerts,
  onLoadAlerts,
  onUpdateAlertStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    "active" | "resolved" | "ignored" | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      await onLoadAlerts(filterStatus || undefined);
    } catch {
      setError("Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, onLoadAlerts]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleUpdateStatus = async (
    id: string,
    status: "active" | "resolved" | "ignored"
  ) => {
    try {
      await onUpdateAlertStatus(id, status);
      await loadAlerts();
    } catch {
      setError("Erro ao atualizar status do alerta");
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Produto não encontrado";
  };

  const getProductStock = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product
      ? {
          current: product.currentStock,
          min: product.minStock,
          unit: product.unit,
        }
      : null;
  };

  const getPriorityColor = (priority: StockAlert["priority"]) => {
    switch (priority) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "";
    }
  };

  const getPriorityLabel = (priority: StockAlert["priority"]) => {
    switch (priority) {
      case "critical":
        return "Crítico";
      case "high":
        return "Alto";
      case "medium":
        return "Médio";
      case "low":
        return "Baixo";
      default:
        return priority;
    }
  };

  const getStatusColor = (status: StockAlert["status"]) => {
    switch (status) {
      case "active":
        return "active";
      case "resolved":
        return "resolved";
      case "ignored":
        return "ignored";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: StockAlert["status"]) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "resolved":
        return "Resolvido";
      case "ignored":
        return "Ignorado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalAlerts = activeAlerts.filter((a) => a.priority === "critical");
  const highAlerts = activeAlerts.filter((a) => a.priority === "high");

  return (
    <div className="stock-alerts-section">
      <div className="section-header">
        <h2>
          <FiAlertTriangle size={24} />
          Alertas de Estoque
        </h2>
        <div className="alerts-summary">
          <div className="summary-item critical">
            <span className="summary-label">Críticos</span>
            <span className="summary-value">{criticalAlerts.length}</span>
          </div>
          <div className="summary-item high">
            <span className="summary-label">Alta Prioridade</span>
            <span className="summary-value">{highAlerts.length}</span>
          </div>
          <div className="summary-item total">
            <span className="summary-label">Total Ativos</span>
            <span className="summary-value">{activeAlerts.length}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <label>Filtrar por Status:</label>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as "active" | "resolved" | "ignored" | ""
            )
          }
          className="filter-select"
        >
          <option value="">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="resolved">Resolvidos</option>
          <option value="ignored">Ignorados</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} />
          <p>Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => {
            const stock = getProductStock(alert.productId);
            return (
              <div
                key={alert.id}
                className={`alert-card ${getPriorityColor(alert.priority)} ${
                  alert.status !== "active" ? "inactive" : ""
                }`}
              >
                <div className="alert-header">
                  <div className="alert-icon">
                    <FiAlertTriangle size={24} />
                  </div>
                  <div className="alert-info">
                    <h3>{getProductName(alert.productId)}</h3>
                    <p className="alert-message">{alert.message}</p>
                    {stock && (
                      <div className="stock-info">
                        <span>
                          Estoque atual: <strong>{stock.current}</strong>{" "}
                          {stock.unit}
                        </span>
                        <span className="separator">•</span>
                        <span>
                          Estoque mínimo: <strong>{stock.min}</strong>{" "}
                          {stock.unit}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="alert-badges">
                    <span
                      className={`priority-badge ${getPriorityColor(
                        alert.priority
                      )}`}
                    >
                      {getPriorityLabel(alert.priority)}
                    </span>
                    <span
                      className={`status-badge ${getStatusColor(alert.status)}`}
                    >
                      {getStatusLabel(alert.status)}
                    </span>
                  </div>
                </div>

                <div className="alert-footer">
                  <span className="alert-date">
                    {formatDate(alert.createdAt)}
                  </span>
                  {alert.status === "active" && (
                    <div className="alert-actions">
                      <button
                        onClick={() => handleUpdateStatus(alert.id, "resolved")}
                        className="btn-action btn-resolve"
                        title="Marcar como Resolvido"
                      >
                        <FiCheckCircle size={16} />
                        Resolver
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, "ignored")}
                        className="btn-action btn-ignore"
                        title="Ignorar Alerta"
                      >
                        <FiXCircle size={16} />
                        Ignorar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockAlertsSection;
