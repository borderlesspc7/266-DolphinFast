import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import type { LoyaltyProgram, Promotion } from "../../types/crm";
import "./LoyaltySection.css";

interface LoyaltySectionProps {
  programs: LoyaltyProgram[];
  promotions: Promotion[];
  onCreateProgram: (
    program: Omit<LoyaltyProgram, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onCreatePromotion: (
    promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onToggleProgram: (id: string, active: boolean) => Promise<void>;
  onTogglePromotion: (id: string, active: boolean) => Promise<void>;
  onDeletePromotion: (id: string) => Promise<void>;
}

const LoyaltySection: React.FC<LoyaltySectionProps> = ({
  programs,
  promotions,
  onCreateProgram,
  onCreatePromotion,
  onToggleProgram,
  onTogglePromotion,
  onDeletePromotion,
}) => {
  const [activeTab, setActiveTab] = useState<"programs" | "promotions">(
    "programs"
  );
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);

  const [programForm, setProgramForm] = useState({
    name: "",
    description: "",
    pointsPerReal: 1,
    active: true,
    rules: {},
  });

  const [promotionForm, setPromotionForm] = useState({
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed" | "points",
    discountValue: 0,
    pointsCost: 0,
    validFrom: "",
    validUntil: "",
    active: true,
  });

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateProgram(programForm);
    setProgramForm({
      name: "",
      description: "",
      pointsPerReal: 1,
      active: true,
      rules: {},
    });
    setShowProgramForm(false);
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePromotion({
      ...promotionForm,
      targetCustomers: [],
    });
    setPromotionForm({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      pointsCost: 0,
      validFrom: "",
      validUntil: "",
      active: true,
    });
    setShowPromotionForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="loyalty-section">
      <div className="section-header">
        <h2>Fidelização</h2>
        <div className="tab-buttons">
          <button
            className={activeTab === "programs" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("programs")}
          >
            Programas de Pontos
          </button>
          <button
            className={
              activeTab === "promotions" ? "tab-btn active" : "tab-btn"
            }
            onClick={() => setActiveTab("promotions")}
          >
            Promoções
          </button>
        </div>
      </div>

      {activeTab === "programs" && (
        <div className="programs-tab">
          <div className="tab-header">
            <h3>Programas de Pontos</h3>
            <button
              className="btn-new"
              onClick={() => setShowProgramForm(!showProgramForm)}
            >
              {showProgramForm ? "Cancelar" : "+ Novo Programa"}
            </button>
          </div>

          {showProgramForm && (
            <form onSubmit={handleCreateProgram} className="program-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome do Programa</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pontos por R$</label>
                  <input
                    type="number"
                    step="0.1"
                    value={programForm.pointsPerReal}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        pointsPerReal: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descrição</label>
                  <textarea
                    value={programForm.description}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Criar Programa
              </button>
            </form>
          )}

          <div className="programs-list">
            {programs.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum programa cadastrado</p>
              </div>
            ) : (
              programs.map((program) => (
                <div key={program.id} className="program-card">
                  <div className="card-header">
                    <h4>{program.name}</h4>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={program.active}
                        onChange={(e) =>
                          onToggleProgram(program.id, e.target.checked)
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="card-description">{program.description}</p>
                  <div className="card-info">
                    <span className="info-badge">
                      {program.pointsPerReal} pontos por R$1
                    </span>
                    <span
                      className={`status-badge ${
                        program.active ? "active" : "inactive"
                      }`}
                    >
                      {program.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "promotions" && (
        <div className="promotions-tab">
          <div className="tab-header">
            <h3>Promoções</h3>
            <button
              className="btn-new"
              onClick={() => setShowPromotionForm(!showPromotionForm)}
            >
              {showPromotionForm ? "Cancelar" : "+ Nova Promoção"}
            </button>
          </div>

          {showPromotionForm && (
            <form onSubmit={handleCreatePromotion} className="promotion-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={promotionForm.title}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Desconto</label>
                  <select
                    value={promotionForm.discountType}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discountType: e.target.value as
                          | "percentage"
                          | "fixed"
                          | "points",
                      })
                    }
                  >
                    <option value="percentage">Percentual</option>
                    <option value="fixed">Valor Fixo</option>
                    <option value="points">Pontos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor do Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promotionForm.discountValue}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {promotionForm.discountType === "points" && (
                  <div className="form-group">
                    <label>Custo em Pontos</label>
                    <input
                      type="number"
                      value={promotionForm.pointsCost}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          pointsCost: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Válido De</label>
                  <input
                    type="date"
                    value={promotionForm.validFrom}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        validFrom: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Válido Até</label>
                  <input
                    type="date"
                    value={promotionForm.validUntil}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        validUntil: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descrição</label>
                  <textarea
                    value={promotionForm.description}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Criar Promoção
              </button>
            </form>
          )}

          <div className="promotions-list">
            {promotions.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma promoção cadastrada</p>
              </div>
            ) : (
              promotions.map((promotion) => (
                <div key={promotion.id} className="promotion-card">
                  <div className="card-header">
                    <h4>{promotion.title}</h4>
                    <div className="card-actions">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={promotion.active}
                          onChange={(e) =>
                            onTogglePromotion(promotion.id, e.target.checked)
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button
                        onClick={() => {
                          if (
                            confirm("Deseja realmente excluir esta promoção?")
                          ) {
                            onDeletePromotion(promotion.id);
                          }
                        }}
                        className="btn-delete-small"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="card-description">{promotion.description}</p>
                  <div className="card-info">
                    <span className="info-badge">
                      {promotion.discountType === "percentage" &&
                        `${promotion.discountValue}% OFF`}
                      {promotion.discountType === "fixed" &&
                        `R$ ${promotion.discountValue.toFixed(2)} OFF`}
                      {promotion.discountType === "points" &&
                        `${promotion.pointsCost} pontos`}
                    </span>
                    <span className="date-range">
                      {formatDate(promotion.validFrom)} -{" "}
                      {formatDate(promotion.validUntil)}
                    </span>
                    <span
                      className={`status-badge ${
                        promotion.active ? "active" : "inactive"
                      }`}
                    >
                      {promotion.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltySection;
