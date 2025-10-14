import { SummaryCards } from "./SummaryCards";
import { ChartsSection } from "./ChartsSection";
import { AlertsSection } from "./AlertsSection";
import "./Dashboard.css";

export const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Visão geral do sistema</p>
      </div>

      <div className="dashboard-content">
        <SummaryCards />
        <ChartsSection />
        <AlertsSection />
      </div>
    </div>
  );
};
