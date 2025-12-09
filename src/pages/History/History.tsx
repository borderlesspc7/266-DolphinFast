import React, { useState, useEffect } from "react";
import { FiClock, FiShoppingBag, FiFileText } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { getCustomerPurchases, getCustomerServices } from "../../services/pdvService";
import "./History.css";

const History: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    status: string;
  }>>([]);
  const [services, setServices] = useState<Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [purchasesData, servicesData] = await Promise.all([
          getCustomerPurchases(user.uid),
          getCustomerServices(user.uid),
        ]);

        setPurchases(purchasesData);
        setServices(servicesData);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError("Não foi possível carregar o histórico. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1 className="history-title">Histórico de Compras e Serviços</h1>
          <p className="history-subtitle">
            Visualize todo o seu histórico de transações e serviços contratados
          </p>
        </div>
        <div className="history-loading">
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1 className="history-title">Histórico de Compras e Serviços</h1>
          <p className="history-subtitle">
            Visualize todo o seu histórico de transações e serviços contratados
          </p>
        </div>
        <div className="history-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title">Histórico de Compras e Serviços</h1>
        <p className="history-subtitle">
          Visualize todo o seu histórico de transações e serviços contratados
        </p>
      </div>

      <div className="history-content">
        <div className="history-section">
          <div className="history-section-header">
            <FiShoppingBag size={24} className="history-section-icon" />
            <h2 className="history-section-title">Compras Realizadas</h2>
          </div>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>
                        <div className="history-date">
                          <FiClock size={16} />
                          <span>{new Date(purchase.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </td>
                      <td>{purchase.service}</td>
                      <td className="history-amount">
                        R$ {purchase.amount.toFixed(2).replace(".", ",")}
                      </td>
                      <td>
                        <span className={`history-status history-status-${purchase.status.toLowerCase()}`}>
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="history-empty">
                      Nenhuma compra encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="history-section">
          <div className="history-section-header">
            <FiFileText size={24} className="history-section-icon" />
            <h2 className="history-section-title">Serviços Contratados</h2>
          </div>
          <div className="history-services-list">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="history-service-card">
                  <div className="history-service-header">
                    <div className="history-service-info">
                      <h3 className="history-service-type">{service.type}</h3>
                      <p className="history-service-description">{service.description}</p>
                    </div>
                    <span className={`history-status history-status-${service.status.toLowerCase()}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="history-service-footer">
                    <span className="history-service-date">
                      <FiClock size={14} />
                      {new Date(service.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="history-empty-message">
                Nenhum serviço encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;

