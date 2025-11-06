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
          <div
            key={index}
            className="summary-card"
            style={{ "--card-accent-color": card.color } as React.CSSProperties}
          >
            <div className="card-header">
              <div className="card-header-left">
                <div className={`card-change ${card.changeType}`}>
                  {card.change}
                </div>
                <div
                  className="card-icon"
                  style={{
                    backgroundColor: `${card.color}15`,
                    boxShadow: `0 4px 12px ${card.color}20`,
                  }}
                >
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <div className="card-header-right">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-value">
                  {card.value.includes("R$") ? (
                    <>
                      <span className="currency-symbol">R$</span>{" "}
                      <span className="currency-value">
                        {card.value.replace("R$", "").trim()}
                      </span>
                    </>
                  ) : (
                    card.value
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
