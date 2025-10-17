import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiTrash2, FiArrowDown, FiArrowUp } from "react-icons/fi";
import type {
  Product,
  StockMovement,
  StockMovementFormData,
} from "../../types/estoque";
import "./StockMovementSection.css";

interface StockMovementSectionProps {
  products: Product[];
  movements: StockMovement[];
  onCreateMovement: (data: StockMovementFormData) => Promise<void>;
  onDeleteMovement: (id: string) => Promise<void>;
  onLoadMovements: (
    productId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
}

const StockMovementSection: React.FC<StockMovementSectionProps> = ({
  products,
  movements,
  onCreateMovement,
  onDeleteMovement,
  onLoadMovements,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StockMovementFormData>({
    productId: "",
    type: "in",
    quantity: 0,
    unitPrice: 0,
    reason: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [filters, setFilters] = useState({
    productId: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      await onLoadMovements(
        filters.productId || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
    } catch {
      setError("Erro ao carregar movimentações");
    } finally {
      setLoading(false);
    }
  }, [filters.productId, filters.startDate, filters.endDate, onLoadMovements]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onCreateMovement(formData);
      resetForm();
    } catch {
      setError("Erro ao criar movimentação");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      type: "in",
      quantity: 0,
      unitPrice: 0,
      reason: "",
      reference: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getMovementTypeIcon = (type: StockMovement["type"]) => {
    switch (type) {
      case "in":
        return <FiArrowDown className="icon-in" />;
      case "out":
        return <FiArrowUp className="icon-out" />;
      default:
        return null;
    }
  };

  const getMovementTypeLabel = (type: StockMovement["type"]) => {
    switch (type) {
      case "in":
        return "Entrada";
      case "out":
        return "Saída";
      case "adjustment":
        return "Ajuste";
      case "loss":
        return "Perda";
      case "transfer":
        return "Transferência";
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: StockMovement["type"]) => {
    switch (type) {
      case "in":
        return "in";
      case "out":
        return "out";
      case "adjustment":
        return "adjustment";
      case "loss":
        return "loss";
      case "transfer":
        return "transfer";
      default:
        return "";
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Produto não encontrado";
  };

  return (
    <div className="stock-movement-section">
      <div className="section-header">
        <h2>Movimentações de Estoque</h2>
        <button className="btn-new" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancelar"
          ) : (
            <>
              <FiPlus size={16} /> Nova Movimentação
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="movement-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Produto *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.currentStock}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Movimentação *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="in">Entrada</option>
                <option value="out">Saída</option>
                <option value="adjustment">Ajuste</option>
                <option value="loss">Perda</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantidade *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Preço Unitário (R$)</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Data *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Motivo *</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="Ex: Compra, Venda, Devolução"
              />
            </div>

            <div className="form-group">
              <label>Referência</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Ex: NF-12345"
              />
            </div>

            <div className="form-group full-width">
              <label>Observações</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Observações sobre a movimentação..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Salvando..." : "Criar Movimentação"}
            </button>
          </div>
        </form>
      )}

      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Produto</label>
            <select
              value={filters.productId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, productId: e.target.value }))
              }
            >
              <option value="">Todos os produtos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              onClick={() =>
                setFilters({ productId: "", startDate: "", endDate: "" })
              }
              className="btn-clear-filters"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="movements-list">
        <h3>Histórico de Movimentações</h3>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <div className="movements-table-wrapper">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                  <th>Motivo</th>
                  <th>Referência</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{formatDate(movement.date)}</td>
                    <td>
                      <div className="product-name">
                        {getProductName(movement.productId)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`type-badge ${getMovementTypeColor(
                          movement.type
                        )}`}
                      >
                        {getMovementTypeIcon(movement.type)}
                        {getMovementTypeLabel(movement.type)}
                      </span>
                    </td>
                    <td>
                      <span className="quantity">{movement.quantity}</span>
                    </td>
                    <td>{formatCurrency(movement.totalValue)}</td>
                    <td>{movement.reason}</td>
                    <td>{movement.reference || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Deseja realmente excluir esta movimentação?"
                              )
                            ) {
                              onDeleteMovement(movement.id);
                            }
                          }}
                          className="btn-action btn-delete"
                          title="Excluir"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMovementSection;
