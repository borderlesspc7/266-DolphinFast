import { FiTrendingUp, FiPieChart } from "react-icons/fi";
import "./ChartsSection.css";

export const ChartsSection = () => {
  return (
    <div className="charts-section">
      <h2 className="section-title">Gráficos</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-section">
              <FiTrendingUp size={20} className="chart-icon" />
              <h3 className="chart-title">Faturamento Diário/Semanal</h3>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="bar" style={{ height: "60%" }}></div>
              <div className="bar" style={{ height: "80%" }}></div>
              <div className="bar" style={{ height: "45%" }}></div>
              <div className="bar" style={{ height: "90%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
              <div className="bar" style={{ height: "85%" }}></div>
              <div className="bar" style={{ height: "95%" }}></div>
            </div>
            <div className="chart-labels">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-section">
              <FiPieChart size={20} className="chart-icon" />
              <h3 className="chart-title">Serviços Mais Vendidos</h3>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="pie-chart">
              <div className="pie-segment segment-1"></div>
              <div className="pie-segment segment-2"></div>
              <div className="pie-segment segment-3"></div>
              <div className="pie-segment segment-4"></div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#3b82f6" }}
                ></div>
                <span>Lavagem Completa</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span>Lavagem Simples</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#f59e0b" }}
                ></div>
                <span>Enceramento</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#8b5cf6" }}
                ></div>
                <span>Detalhamento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
