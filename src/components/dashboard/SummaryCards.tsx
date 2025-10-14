import { FiDollarSign, FiTruck, FiUsers, FiCreditCard } from "react-icons/fi";
import "./SummaryCards.css";

export const SummaryCards = () => {
  const cards = [
    {
      title: "Vendas do Dia",
      value: "R$ 2.450,00",
      change: "+12%",
      changeType: "positive",
      icon: FiDollarSign,
      color: "#10b981",
    },
    {
      title: "Lavagens Realizadas",
      value: "47",
      change: "+8%",
      changeType: "positive",
      icon: FiTruck,
      color: "#3b82f6",
    },
    {
      title: "Clientes Ativos",
      value: "156",
      change: "+5%",
      changeType: "positive",
      icon: FiUsers,
      color: "#8b5cf6",
    },
    {
      title: "Caixa Atual",
      value: "R$ 8.750,00",
      change: "+15%",
      changeType: "positive",
      icon: FiCreditCard,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="summary-cards">
      <h2 className="section-title">Resumo</h2>
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="summary-card">
            <div className="card-header">
              <div
                className="card-icon"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div className={`card-change ${card.changeType}`}>
                {card.change}
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
