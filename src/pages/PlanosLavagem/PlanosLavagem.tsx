import React, { useState, useEffect } from "react";
import { FiDroplet } from "react-icons/fi";
import PlanoForm from "../../components/planosLavagem/PlanoForm";
import PlanoList from "../../components/planosLavagem/PlanoList";
import type {
  PlanoLavagem,
  PlanoLavagemFormData,
} from "../../types/planosLavagem";
import {
  createPlanoLavagem,
  updatePlanoLavagem,
  deletePlanoLavagem,
  getAllPlanosLavagem,
} from "../../services/planosLavagemService";
import "./PlanosLavagem.css";

const PlanosLavagem: React.FC = () => {
  const [showPlanoForm, setShowPlanoForm] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoLavagem | undefined>(
    undefined
  );
  const [planos, setPlanos] = useState<PlanoLavagem[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      setLoading(true);
      const data = await getAllPlanosLavagem();
      setPlanos(data);
    } catch (err) {
      setError("Erro ao carregar planos de lavagem");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlano = async (data: PlanoLavagemFormData) => {
    try {
      setError("");
      setSuccessMessage("");

      // Validações
      if (!data.nome || data.nome.trim() === "") {
        setError("O nome do plano é obrigatório");
        return;
      }

      if (data.servicos.length === 0) {
        setError("Adicione pelo menos um serviço ao plano");
        return;
      }

      if (data.preco < 0) {
        setError("O preço não pode ser negativo");
        return;
      }

      if (data.duracaoEstimada <= 0) {
        setError("A duração estimada deve ser maior que zero");
        return;
      }

      // Criar o plano
      await createPlanoLavagem(data);

      // Recarregar dados
      await loadPlanos();

      // Mostrar mensagem de sucesso
      setSuccessMessage("Plano de lavagem criado com sucesso!");

      // Fechar formulário após um breve delay
      setTimeout(() => {
        setShowPlanoForm(false);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Erro ao criar plano:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar plano de lavagem. Tente novamente."
      );
    }
  };

  const handleUpdatePlano = async (data: PlanoLavagemFormData) => {
    if (!editingPlano) return;
    try {
      setError("");
      setSuccessMessage("");

      await updatePlanoLavagem(editingPlano.id, data);
      await loadPlanos();
      setSuccessMessage("Plano de lavagem atualizado com sucesso!");
      setShowPlanoForm(false);
      setEditingPlano(undefined);

      setTimeout(() => {
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar plano:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao atualizar plano de lavagem. Tente novamente."
      );
    }
  };

  const handleDeletePlano = async (id: string) => {
    try {
      setError("");
      await deletePlanoLavagem(id);
      await loadPlanos();
      setSuccessMessage("Plano de lavagem excluído com sucesso!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Erro ao deletar plano:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao deletar plano de lavagem. Tente novamente."
      );
    }
  };

  const handleEditPlano = (plano: PlanoLavagem) => {
    setEditingPlano(plano);
    setShowPlanoForm(true);
  };

  return (
    <div className="planos-lavagem-page">
      <div className="page-header">
        <h1>
          <FiDroplet size={32} />
          Planos de Lavagem
        </h1>
        <p>Gerencie os planos e serviços de lavagem oferecidos</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-error">
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
          <button
            onClick={() => setSuccessMessage("")}
            className="close-success"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando planos...</p>
        </div>
      ) : (
        <div className="planos-content">
          {showPlanoForm ? (
            <PlanoForm
              plano={editingPlano}
              onSubmit={
                editingPlano ? handleUpdatePlano : handleCreatePlano
              }
              onCancel={() => {
                setShowPlanoForm(false);
                setEditingPlano(undefined);
              }}
            />
          ) : (
            <PlanoList
              planos={planos}
              onEdit={handleEditPlano}
              onDelete={handleDeletePlano}
              onAddNew={() => setShowPlanoForm(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PlanosLavagem;


