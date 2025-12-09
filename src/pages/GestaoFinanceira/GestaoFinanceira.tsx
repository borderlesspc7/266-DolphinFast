import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiCreditCard,
  FiPieChart,
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiShoppingBag,
  FiFilter,
} from "react-icons/fi";
import { getSales, getDailyReport } from "../../services/pdvService";
import type { Sale, DailyReport } from "../../types/pdv";
import "./GestaoFinanceira.css";

type ReportPeriod = "today" | "week" | "month" | "custom";

const GestaoFinanceira: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("today");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "reports">("overview");

  useEffect(() => {
    loadFinancialData();
  }, [period, startDate, endDate]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      let start: Date | undefined;
      let end: Date | undefined;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (period) {
        case "today":
          start = new Date(today);
          end = new Date(today);
          end.setHours(23, 59, 59, 999);
          break;
        case "week":
          start = new Date(today);
          start.setDate(today.getDate() - 7);
          end = new Date(today);
          end.setHours(23, 59, 59, 999);
          break;
        case "month":
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = new Date(today);
          end.setHours(23, 59, 59, 999);
          break;
        case "custom":
          if (startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
          }
          break;
      }

      const [salesData, todayReport] = await Promise.all([
        getSales(start, end),
        getDailyReport(today),
      ]);

      setSales(salesData);
      setFilteredSales(salesData);
      setDailyReport(todayReport);
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err);
      setError("Não foi possível carregar os dados financeiros. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR");
  };

  const calculateTotals = () => {
    const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const paymentMethods = filteredSales.reduce(
      (acc, sale) => {
        acc[sale.payment.method] += sale.total;
        return acc;
      },
      {
        pix: 0,
        debito: 0,
        credito: 0,
        dinheiro: 0,
      }
    );

    return { total, totalTransactions, paymentMethods };
  };

  const { total, totalTransactions, paymentMethods } = calculateTotals();

  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      pix: "PIX",
      debito: "Débito",
      credito: "Crédito",
      dinheiro: "Dinheiro",
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
      pix: "#10b981",
      debito: "#3b82f6",
      credito: "#8b5cf6",
      dinheiro: "#f59e0b",
    };
    return colors[method] || "#666";
  };

  if (loading && sales.length === 0) {
    return (
      <div className="gestao-financeira-page">
        <div className="gestao-financeira-header">
          <h1 className="gestao-financeira-title">Gestão Financeira e Contábil</h1>
          <p className="gestao-financeira-subtitle">
            Controle financeiro e contabilidade
          </p>
        </div>
        <div className="gestao-financeira-loading">
          <div className="spinner"></div>
          <p>Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestao-financeira-page">
      <div className="gestao-financeira-header">
        <div>
          <h1 className="gestao-financeira-title">Gestão Financeira e Contábil</h1>
          <p className="gestao-financeira-subtitle">
            Controle financeiro e contabilidade
          </p>
        </div>
        <button className="btn-refresh" onClick={loadFinancialData} disabled={loading}>
          <FiRefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="finance-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FiPieChart size={18} />
          Visão Geral
        </button>
        <button
          className={`tab-btn ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          <FiShoppingBag size={18} />
          Vendas ({totalTransactions})
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <FiFileText size={18} />
          Relatórios
        </button>
      </div>

      {/* Period Filter */}
      <div className="period-filter">
        <div className="period-buttons">
          <button
            className={`period-btn ${period === "today" ? "active" : ""}`}
            onClick={() => setPeriod("today")}
          >
            Hoje
          </button>
          <button
            className={`period-btn ${period === "week" ? "active" : ""}`}
            onClick={() => setPeriod("week")}
          >
            Últimos 7 dias
          </button>
          <button
            className={`period-btn ${period === "month" ? "active" : ""}`}
            onClick={() => setPeriod("month")}
          >
            Este Mês
          </button>
          <button
            className={`period-btn ${period === "custom" ? "active" : ""}`}
            onClick={() => setPeriod("custom")}
          >
            <FiCalendar size={16} />
            Personalizado
          </button>
        </div>
        {period === "custom" && (
          <div className="custom-date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <span>até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="finance-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Summary Cards */}
            <div className="summary-cards-grid">
              <div className="summary-card revenue">
                <div className="summary-card-icon">
                  <FiDollarSign size={24} />
                </div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Receita Total</span>
                  <span className="summary-card-value">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="summary-card transactions">
                <div className="summary-card-icon">
                  <FiShoppingBag size={24} />
                </div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Transações</span>
                  <span className="summary-card-value">{totalTransactions}</span>
                </div>
              </div>
              <div className="summary-card average">
                <div className="summary-card-icon">
                  <FiTrendingUp size={24} />
                </div>
                <div className="summary-card-content">
                  <span className="summary-card-label">Ticket Médio</span>
                  <span className="summary-card-value">
                    {totalTransactions > 0
                      ? formatCurrency(total / totalTransactions)
                      : formatCurrency(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="payment-methods-section">
              <h2 className="section-title">
                <FiCreditCard size={20} />
                Métodos de Pagamento
              </h2>
              <div className="payment-methods-grid">
                {Object.entries(paymentMethods).map(([method, amount]) => (
                  <div key={method} className="payment-method-card">
                    <div
                      className="payment-method-icon"
                      style={{ backgroundColor: `${getPaymentMethodColor(method)}15` }}
                    >
                      <FiCreditCard
                        size={20}
                        style={{ color: getPaymentMethodColor(method) }}
                      />
                    </div>
                    <div className="payment-method-content">
                      <span className="payment-method-label">
                        {getPaymentMethodLabel(method)}
                      </span>
                      <span className="payment-method-value">{formatCurrency(amount)}</span>
                      <div className="payment-method-percentage">
                        {total > 0
                          ? `${((amount / total) * 100).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </div>
                    <div
                      className="payment-method-bar"
                      style={{
                        width: `${total > 0 ? (amount / total) * 100 : 0}%`,
                        backgroundColor: getPaymentMethodColor(method),
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Report (if available) */}
            {dailyReport && (
              <div className="daily-report-section">
                <h2 className="section-title">
                  <FiFileText size={20} />
                  Relatório do Dia ({formatDate(dailyReport.date)})
                </h2>
                <div className="daily-report-card">
                  <div className="daily-report-grid">
                    <div className="daily-report-item">
                      <span className="daily-report-label">Vendas Totais</span>
                      <span className="daily-report-value">
                        {formatCurrency(dailyReport.totalSales)}
                      </span>
                    </div>
                    <div className="daily-report-item">
                      <span className="daily-report-label">Transações</span>
                      <span className="daily-report-value">
                        {dailyReport.totalTransactions}
                      </span>
                    </div>
                  </div>
                  <div className="daily-report-payments">
                    <h3>Por Método de Pagamento</h3>
                    <div className="daily-report-payments-grid">
                      {Object.entries(dailyReport.paymentMethods).map(([method, amount]) => (
                        <div key={method} className="daily-report-payment-item">
                          <span>{getPaymentMethodLabel(method)}</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="sales-tab">
            <div className="sales-header">
              <h2 className="section-title">Vendas Realizadas</h2>
              <div className="sales-actions">
                <button className="btn-export">
                  <FiDownload size={18} />
                  Exportar
                </button>
              </div>
            </div>
            {filteredSales.length > 0 ? (
              <div className="sales-table-container">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Cliente</th>
                      <th>Itens</th>
                      <th>Valor</th>
                      <th>Pagamento</th>
                      <th>Funcionário</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <div className="sale-date">
                            {formatDate(sale.date)}
                            <span className="sale-time">
                              {new Date(sale.date).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td>{sale.customerName || "Cliente não identificado"}</td>
                        <td>
                          <div className="sale-items">
                            {sale.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="sale-item-tag">
                                {item.name} ({item.quantity}x)
                              </span>
                            ))}
                            {sale.items.length > 2 && (
                              <span className="sale-item-more">
                                +{sale.items.length - 2} mais
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="sale-amount">{formatCurrency(sale.total)}</td>
                        <td>
                          <span
                            className="payment-badge"
                            style={{
                              backgroundColor: `${getPaymentMethodColor(sale.payment.method)}15`,
                              color: getPaymentMethodColor(sale.payment.method),
                            }}
                          >
                            {getPaymentMethodLabel(sale.payment.method)}
                          </span>
                        </td>
                        <td>{sale.employeeName}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              sale.status === "completed" ? "completed" : "cancelled"
                            }`}
                          >
                            {sale.status === "completed" ? "Concluída" : "Cancelada"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FiShoppingBag size={48} />
                <p>Nenhuma venda encontrada no período selecionado</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="reports-tab">
            <h2 className="section-title">Relatórios Financeiros</h2>
            <div className="reports-grid">
              <div className="report-card">
                <div className="report-card-header">
                  <FiFileText size={24} />
                  <h3>Relatório Diário</h3>
                </div>
                <p className="report-card-description">
                  Visualize vendas, receitas e métodos de pagamento do dia atual
                </p>
                <button className="btn-generate-report">
                  Gerar Relatório
                </button>
              </div>
              <div className="report-card">
                <div className="report-card-header">
                  <FiTrendingUp size={24} />
                  <h3>Relatório Mensal</h3>
                </div>
                <p className="report-card-description">
                  Análise completa das vendas e receitas do mês atual
                </p>
                <button className="btn-generate-report">
                  Gerar Relatório
                </button>
              </div>
              <div className="report-card">
                <div className="report-card-header">
                  <FiPieChart size={24} />
                  <h3>Análise de Métodos de Pagamento</h3>
                </div>
                <p className="report-card-description">
                  Distribuição de pagamentos por método no período selecionado
                </p>
                <button className="btn-generate-report">
                  Gerar Relatório
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestaoFinanceira;

