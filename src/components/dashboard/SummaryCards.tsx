import { useState, useEffect } from "react";
import { FiDollarSign, FiTruck, FiUsers, FiCreditCard } from "react-icons/fi";
import {
  getTodaySalesAmount,
  getTodayServicesCount,
  getCurrentCashAmount,
  getSalesAmountByPeriod,
  getServicesCountByPeriod,
  getCashAmountByDate,
} from "../../services/pdvService";
import { getActiveCustomersCount, getAllCustomers } from "../../services/crmService";
import "./SummaryCards.css";

interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: typeof FiDollarSign;
  color: string;
}

export const SummaryCards = () => {
  const [cards, setCards] = useState<SummaryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Data de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Data de ontem para comparação
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const endYesterday = new Date(yesterday);
        endYesterday.setHours(23, 59, 59, 999);

        // Buscar dados do dia atual e do dia anterior em paralelo
        const [
          todaySales,
          yesterdaySales,
          todayServices,
          yesterdayServices,
          currentCash,
          yesterdayCash,
          activeCustomers,
          allCustomers,
        ] = await Promise.all([
          getTodaySalesAmount(),
          getSalesAmountByPeriod(yesterday, endYesterday),
          getTodayServicesCount(),
          getServicesCountByPeriod(yesterday, endYesterday),
          getCurrentCashAmount(),
          getCashAmountByDate(yesterday),
          getActiveCustomersCount(),
          getAllCustomers(),
        ]);

        // Calcular percentuais de mudança
        const salesChange = calculatePercentageChange(todaySales, yesterdaySales);
        const servicesChange = calculatePercentageChange(
          todayServices,
          yesterdayServices
        );
        const cashChange = calculatePercentageChange(currentCash, yesterdayCash);

        // Para clientes ativos, vamos comparar novos clientes de hoje com os de ontem
        const endToday = new Date(today);
        endToday.setHours(23, 59, 59, 999);
        
        const newCustomersToday = allCustomers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          return createdAt >= today && createdAt <= endToday;
        }).length;

        const newCustomersYesterday = allCustomers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          return createdAt >= yesterday && createdAt <= endYesterday;
        }).length;

        // Para clientes ativos, vamos mostrar crescimento baseado em novos cadastros
        // Se não houver novos hoje, vamos comparar com a tendência de crescimento semanal
        let customersChange;
        if (newCustomersToday > 0 || newCustomersYesterday > 0) {
          customersChange = calculatePercentageChange(
            newCustomersToday,
            newCustomersYesterday
          );
        } else {
          // Comparar últimos 7 dias com os 7 dias anteriores
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const fourteenDaysAgo = new Date(today);
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

          const recentCustomers = allCustomers.filter((customer) => {
            const createdAt = new Date(customer.createdAt);
            return createdAt >= sevenDaysAgo && createdAt < today;
          }).length;

          const previousPeriodCustomers = allCustomers.filter((customer) => {
            const createdAt = new Date(customer.createdAt);
            return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo;
          }).length;

          customersChange = calculatePercentageChange(
            recentCustomers,
            previousPeriodCustomers
          );
        }

        // Formatar valores
        const formatCurrency = (value: number) => {
          return new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value);
        };

        const newCards: SummaryCardData[] = [
          {
            title: "Vendas do Dia",
            value: `R$ ${formatCurrency(todaySales)}`,
            change: salesChange.change,
            changeType: salesChange.type,
            icon: FiDollarSign,
            color: "#10b981",
          },
          {
            title: "Lavagens Realizadas",
            value: todayServices.toString(),
            change: servicesChange.change,
            changeType: servicesChange.type,
            icon: FiTruck,
            color: "#3b82f6",
          },
          {
            title: "Clientes Ativos",
            value: activeCustomers.toString(),
            change: customersChange.change,
            changeType: customersChange.type,
            icon: FiUsers,
            color: "#8b5cf6",
          },
          {
            title: "Caixa Atual",
            value: `R$ ${formatCurrency(currentCash)}`,
            change: cashChange.change,
            changeType: cashChange.type,
            icon: FiCreditCard,
            color: "#f59e0b",
          },
        ];

        setCards(newCards);
      } catch (err) {
        console.error("Erro ao buscar dados do resumo:", err);
        setError("Erro ao carregar dados do resumo");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  // Função auxiliar para calcular mudança percentual
  const calculatePercentageChange = (
    current: number,
    previous: number
  ): { change: string; type: "positive" | "negative" | "neutral" } => {
    if (previous === 0) {
      if (current > 0) {
        return { change: "+100%", type: "positive" };
      }
      return { change: "0%", type: "neutral" };
    }

    const change = ((current - previous) / previous) * 100;
    const roundedChange = Math.round(change);

    if (roundedChange > 0) {
      return { change: `+${roundedChange}%`, type: "positive" };
    } else if (roundedChange < 0) {
      return { change: `${roundedChange}%`, type: "negative" };
    } else {
      return { change: "0%", type: "neutral" };
    }
  };

  if (loading) {
    return (
      <div className="summary-cards">
        <h2 className="section-title">Resumo</h2>
        <div className="cards-grid">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="summary-card loading">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-change">-</div>
                  <div className="card-icon"></div>
                </div>
                <div className="card-header-right">
                  <h3 className="card-title">Carregando...</h3>
                  <p className="card-value">-</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-cards">
        <h2 className="section-title">Resumo</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

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
