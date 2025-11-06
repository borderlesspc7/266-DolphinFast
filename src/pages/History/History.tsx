import React from "react";
import { FiClock, FiShoppingBag, FiFileText } from "react-icons/fi";
import "./History.css";

const History: React.FC = () => {
  // Dados mockados - substituir por dados reais do Firebase
  const purchases = [
    {
      id: "1",
      date: "2024-01-15",
      service: "Lavagem Completa",
      amount: 150.0,
      status: "Concluído",
    },
    {
      id: "2",
      date: "2024-01-10",
      service: "Lavagem Simples",
      amount: 80.0,
      status: "Concluído",
    },
    {
      id: "3",
      date: "2024-01-05",
      service: "Lavagem Premium",
      amount: 200.0,
      status: "Concluído",
    },
  ];

  const services = [
    {
      id: "1",
      date: "2024-01-15",
      type: "Plano Mensal",
      description: "Plano de lavagem mensal - 4 lavagens",
      status: "Ativo",
    },
    {
      id: "2",
      date: "2024-01-10",
      type: "Lavagem Avulsa",
      description: "Lavagem completa com cera",
      status: "Concluído",
    },
  ];

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

