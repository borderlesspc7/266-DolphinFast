import React, { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiDroplet,
  FiSearch,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import type { PlanoLavagem } from "../../types/planosLavagem";
import "./PlanoList.css";

interface PlanoListProps {
  planos: PlanoLavagem[];
  onEdit: (plano: PlanoLavagem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const PlanoList: React.FC<PlanoListProps> = ({
  planos,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipoVeiculo, setFilterTipoVeiculo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTipoVeiculoLabel = (tipo: PlanoLavagem["tipoVeiculo"]) => {
    const labels: Record<PlanoLavagem["tipoVeiculo"], string> = {
      carro: "Carro",
      moto: "Moto",
      caminhao: "Caminhão",
      onibus: "Ônibus",
      outros: "Outros",
    };
    return labels[tipo] || tipo;
  };

  const getFrequenciaLabel = (freq?: string) => {
    const labels: Record<string, string> = {
      unico: "Único",
      semanal: "Semanal",
      quinzenal: "Quinzenal",
      mensal: "Mensal",
    };
    return labels[freq || "unico"] || "Único";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const tiposVeiculo = Array.from(new Set(planos.map((p) => p.tipoVeiculo)));

  const filteredPlanos = planos.filter((plano) => {
    const matchesSearch =
      plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo =
      !filterTipoVeiculo || plano.tipoVeiculo === filterTipoVeiculo;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "ativo" && plano.ativo) ||
      (filterStatus === "inativo" && !plano.ativo);

    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="plano-list-container">
      <div className="list-header">
        <div className="header-left">
          <h2>
            <FiDroplet size={24} />
            Planos de Lavagem
          </h2>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{planos.length}</span>
            </div>
            <div className="stat-item active">
              <span className="stat-label">Ativos</span>
              <span className="stat-value">
                {planos.filter((p) => p.ativo).length}
              </span>
            </div>
          </div>
        </div>
        <button className="btn-new" onClick={onAddNew}>
          <FiDroplet size={16} />
          Novo Plano
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterTipoVeiculo}
            onChange={(e) => setFilterTipoVeiculo(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Tipos</option>
            {tiposVeiculo.map((tipo) => (
              <option key={tipo} value={tipo}>
                {getTipoVeiculoLabel(tipo)}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {filteredPlanos.length === 0 ? (
        <div className="empty-state">
          <FiDroplet size={48} />
          <p>Nenhum plano encontrado</p>
        </div>
      ) : (
        <div className="planos-grid">
          {filteredPlanos.map((plano) => (
            <div key={plano.id} className="plano-card">
              <div className="plano-card-header">
                <div className="plano-title-section">
                  <h3>{plano.nome}</h3>
                  <span
                    className={`status-badge ${plano.ativo ? "active" : "inactive"}`}
                  >
                    {plano.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="plano-actions">
                  <button
                    onClick={() => onEdit(plano)}
                    className="btn-action btn-edit"
                    title="Editar"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente excluir este plano?")) {
                        onDelete(plano.id);
                      }
                    }}
                    className="btn-action btn-delete"
                    title="Excluir"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {plano.descricao && (
                <p className="plano-descricao">{plano.descricao}</p>
              )}

              <div className="plano-info">
                <div className="info-item">
                  <span className="info-label">Tipo de Veículo:</span>
                  <span className="info-value">
                    {getTipoVeiculoLabel(plano.tipoVeiculo)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Frequência:</span>
                  <span className="info-value">
                    {getFrequenciaLabel(plano.frequencia)}
                  </span>
                </div>
              </div>

              <div className="plano-servicos">
                <div className="servicos-header">
                  <span className="servicos-label">
                    Serviços ({plano.servicos.length})
                  </span>
                </div>
                <div className="servicos-list">
                  {plano.servicos.slice(0, 3).map((servico) => (
                    <div key={servico.id} className="servico-badge">
                      {servico.nome}
                    </div>
                  ))}
                  {plano.servicos.length > 3 && (
                    <div className="servico-badge more">
                      +{plano.servicos.length - 3} mais
                    </div>
                  )}
                </div>
              </div>

              <div className="plano-footer">
                <div className="plano-price">
                  <FiDollarSign size={18} />
                  <span className="price-value">
                    {formatCurrency(plano.preco)}
                  </span>
                </div>
                <div className="plano-duration">
                  <FiClock size={18} />
                  <span>{formatDuration(plano.duracaoEstimada)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanoList;


