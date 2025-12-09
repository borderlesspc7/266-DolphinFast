import { useState, useEffect } from "react";
import { FiTrendingUp, FiPieChart } from "react-icons/fi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDailySalesData, getTopSellingServices } from "../../services/pdvService";
import "./ChartsSection.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export const ChartsSection = () => {
  const [dailySales, setDailySales] = useState<
    Array<{ date: string; amount: number }>
  >([]);
  const [topServices, setTopServices] = useState<
    Array<{ name: string; quantity: number; revenue: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7" | "30">("7");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [salesData, servicesData] = await Promise.all([
          getDailySalesData(parseInt(period)),
          getTopSellingServices(parseInt(period), 5),
        ]);

        setDailySales(salesData);
        setTopServices(servicesData);
      } catch (err) {
        console.error("Erro ao buscar dados dos gráficos:", err);
        setError("Erro ao carregar dados dos gráficos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Formatar datas para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[date.getDay()];
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Preparar dados do gráfico de barras com labels formatados
  const chartData = dailySales.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
    amountFormatted: formatCurrency(item.amount),
  }));

  // Preparar dados do gráfico de pizza
  const pieData = topServices.map((service) => ({
    name: service.name,
    value: service.quantity,
    revenue: service.revenue,
  }));

  if (loading) {
    return (
      <div className="charts-section">
        <h2 className="section-title">Gráficos</h2>
        <div className="charts-loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-section">
        <h2 className="section-title">Gráficos</h2>
        <div className="charts-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-section">
      <div className="charts-header">
        <h2 className="section-title">Gráficos</h2>
        <div className="period-selector">
          <button
            className={period === "7" ? "active" : ""}
            onClick={() => setPeriod("7")}
          >
            7 dias
          </button>
          <button
            className={period === "30" ? "active" : ""}
            onClick={() => setPeriod("30")}
          >
            30 dias
          </button>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-section">
              <FiTrendingUp size={20} className="chart-icon" />
              <h3 className="chart-title">Faturamento Diário</h3>
            </div>
          </div>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        notation: "compact",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-section">
              <FiPieChart size={20} className="chart-icon" />
              <h3 className="chart-title">Serviços Mais Vendidos</h3>
            </div>
          </div>
          <div className="chart-container">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} vendas - ${formatCurrency(props.payload.revenue)}`,
                      "Quantidade",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>Nenhum serviço vendido no período selecionado</p>
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="chart-legend">
              {pieData.map((item, index) => (
                <div key={item.name} className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span>
                    {item.name} ({item.value} vendas)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
