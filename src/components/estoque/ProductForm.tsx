import React, { useState, useEffect } from "react";
import type { Product, ProductFormData } from "../../types/estoque";
import "./ProductForm.css";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    sku: "",
    barcode: "",
    unit: "unit",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    costPrice: 0,
    supplier: "",
    supplierContact: "",
    location: "",
    status: "active",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        sku: product.sku,
        barcode: product.barcode || "",
        unit: product.unit,
        currentStock: product.currentStock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        unitPrice: product.unitPrice,
        costPrice: product.costPrice,
        supplier: product.supplier,
        supplierContact: product.supplierContact || "",
        location: product.location || "",
        status: product.status,
        image: product.image || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch {
      setError("Erro ao salvar produto");
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
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const categories = [
    "Produtos de Limpeza",
    "Acessórios",
    "Perfumaria",
    "Ferramentas",
    "Consumíveis",
    "Equipamentos",
    "Outros",
  ];

  const units = [
    { value: "unit", label: "Unidade" },
    { value: "kg", label: "Quilograma (kg)" },
    { value: "l", label: "Litro (L)" },
    { value: "m", label: "Metro (m)" },
    { value: "box", label: "Caixa" },
    { value: "pack", label: "Pacote" },
  ];

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2>{product ? "Editar Produto" : "Novo Produto"}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h3>Informações Básicas</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Nome do Produto *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome do produto"
              />
            </div>

            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descrição detalhada do produto"
              />
            </div>

            <div className="form-group">
              <label>Categoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="Código SKU"
              />
            </div>

            <div className="form-group">
              <label>Código de Barras</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Código de barras"
              />
            </div>

            <div className="form-group">
              <label>Unidade de Medida *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Estoque</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Estoque Atual *</label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Estoque Mínimo *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Estoque Máximo *</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Localização</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Prateleira A1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Preços</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Preço de Custo (R$) *</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Preço de Venda (R$) *</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Fornecedor</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome do Fornecedor *</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                placeholder="Nome do fornecedor"
              />
            </div>

            <div className="form-group">
              <label>Contato do Fornecedor</label>
              <input
                type="text"
                name="supplierContact"
                value={formData.supplierContact}
                onChange={handleChange}
                placeholder="Telefone ou e-mail"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Status do Produto *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Salvando..." : product ? "Atualizar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
