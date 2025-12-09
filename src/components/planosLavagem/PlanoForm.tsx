import React, { useState, useEffect } from "react";
import type { PlanoLavagem, PlanoLavagemFormData, ServicoLavagem } from "../../types/planosLavagem";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import "./PlanoForm.css";

interface PlanoFormProps {
  plano?: PlanoLavagem;
  onSubmit: (data: PlanoLavagemFormData) => Promise<void>;
  onCancel: () => void;
}

const PlanoForm: React.FC<PlanoFormProps> = ({
  plano,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PlanoLavagemFormData>({
    nome: "",
    descricao: "",
    tipoVeiculo: "carro",
    servicos: [],
    preco: 0,
    duracaoEstimada: 0,
    frequencia: "unico",
    ativo: true,
    imagem: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome,
        descricao: plano.descricao,
        tipoVeiculo: plano.tipoVeiculo,
        servicos: plano.servicos || [],
        preco: plano.preco,
        duracaoEstimada: plano.duracaoEstimada,
        frequencia: plano.frequencia || "unico",
        ativo: plano.ativo,
        imagem: plano.imagem || "",
      });
    }
  }, [plano]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validações
      if (!formData.nome || formData.nome.trim() === "") {
        setError("O nome do plano é obrigatório");
        setLoading(false);
        return;
      }

      if (formData.servicos.length === 0) {
        setError("Adicione pelo menos um serviço ao plano");
        setLoading(false);
        return;
      }

      if (formData.preco < 0) {
        setError("O preço não pode ser negativo");
        setLoading(false);
        return;
      }

      if (formData.duracaoEstimada <= 0) {
        setError("A duração estimada deve ser maior que zero");
        setLoading(false);
        return;
      }

      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar plano de lavagem"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const addServico = () => {
    const novoServico: ServicoLavagem = {
      id: Date.now().toString(),
      nome: "",
      descricao: "",
      preco: 0,
      duracao: 0,
    };
    setFormData((prev) => ({
      ...prev,
      servicos: [...prev.servicos, novoServico],
    }));
  };

  const removeServico = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      servicos: prev.servicos.filter((s) => s.id !== id),
    }));
  };

  const updateServico = (id: string, field: keyof ServicoLavagem, value: any) => {
    setFormData((prev) => {
      const updatedServicos = prev.servicos.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      );
      
      // Recalcular totais quando um serviço for atualizado
      const precoTotal = updatedServicos.reduce(
        (sum, s) => sum + (s.preco || 0),
        0
      );
      const duracaoTotal = updatedServicos.reduce(
        (sum, s) => sum + (s.duracao || 0),
        0
      );
      
      return {
        ...prev,
        servicos: updatedServicos,
        preco: precoTotal,
        duracaoEstimada: duracaoTotal,
      };
    });
  };

  const tiposVeiculo = [
    { value: "carro", label: "Carro" },
    { value: "moto", label: "Moto" },
    { value: "caminhao", label: "Caminhão" },
    { value: "onibus", label: "Ônibus" },
    { value: "outros", label: "Outros" },
  ];

  const frequencias = [
    { value: "unico", label: "Único" },
    { value: "semanal", label: "Semanal" },
    { value: "quinzenal", label: "Quinzenal" },
    { value: "mensal", label: "Mensal" },
  ];

  // Calcular preço total e duração total dos serviços
  const calcularTotais = () => {
    if (formData.servicos.length > 0) {
      const precoTotal = formData.servicos.reduce(
        (sum, s) => sum + (s.preco || 0),
        0
      );
      const duracaoTotal = formData.servicos.reduce(
        (sum, s) => sum + (s.duracao || 0),
        0
      );
      setFormData((prev) => ({
        ...prev,
        preco: precoTotal,
        duracaoEstimada: duracaoTotal,
      }));
    }
  };

  // Atualizar totais quando um serviço for adicionado ou removido
  useEffect(() => {
    if (formData.servicos.length > 0) {
      calcularTotais();
    }
  }, [formData.servicos.length]);

  return (
    <div className="plano-form-container">
      <div className="form-header">
        <h2>{plano ? "Editar Plano de Lavagem" : "Novo Plano de Lavagem"}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="plano-form">
        <div className="form-section">
          <h3>Informações Básicas</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Nome do Plano *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Lavagem Completa Premium"
              />
            </div>

            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva os detalhes do plano de lavagem"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Veículo *</label>
              <select
                name="tipoVeiculo"
                value={formData.tipoVeiculo}
                onChange={handleChange}
                required
              >
                {tiposVeiculo.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Frequência</label>
              <select
                name="frequencia"
                value={formData.frequencia}
                onChange={handleChange}
              >
                {frequencias.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preço Total (R$) *</label>
              <input
                type="number"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Duração Estimada (minutos) *</label>
              <input
                type="number"
                name="duracaoEstimada"
                value={formData.duracaoEstimada}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                />
                <span>Plano Ativo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Serviços Incluídos</h3>
            <button
              type="button"
              onClick={addServico}
              className="btn-add-servico"
            >
              <FiPlus size={16} />
              Adicionar Serviço
            </button>
          </div>

          {formData.servicos.length === 0 ? (
            <div className="empty-servicos">
              <p>Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.</p>
            </div>
          ) : (
            <div className="servicos-list">
              {formData.servicos.map((servico, index) => (
                <div key={servico.id} className="servico-item">
                  <div className="servico-header">
                    <h4>Serviço {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeServico(servico.id)}
                      className="btn-remove-servico"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="servico-fields">
                    <div className="form-group">
                      <label>Nome do Serviço *</label>
                      <input
                        type="text"
                        value={servico.nome}
                        onChange={(e) =>
                          updateServico(servico.id, "nome", e.target.value)
                        }
                        required
                        placeholder="Ex: Lavagem Externa"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descrição</label>
                      <input
                        type="text"
                        value={servico.descricao || ""}
                        onChange={(e) =>
                          updateServico(servico.id, "descricao", e.target.value)
                        }
                        placeholder="Descrição do serviço"
                      />
                    </div>
                    <div className="form-group">
                      <label>Preço (R$)</label>
                      <input
                        type="number"
                        value={servico.preco}
                        onChange={(e) =>
                          updateServico(
                            servico.id,
                            "preco",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duração (minutos)</label>
                      <input
                        type="number"
                        value={servico.duracao}
                        onChange={(e) =>
                          updateServico(
                            servico.id,
                            "duracao",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Salvando..." : plano ? "Atualizar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanoForm;

