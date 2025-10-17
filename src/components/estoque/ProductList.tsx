import React, { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiAlertTriangle,
  FiSearch,
} from "react-icons/fi";
import type { Product } from "../../types/estoque";
import "./ProductList.css";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onViewMovements: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onViewMovements,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return "out";
    if (product.currentStock <= product.minStock) return "low";
    if (product.currentStock >= product.maxStock) return "high";
    return "normal";
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case "out":
        return "Sem Estoque";
      case "low":
        return "Estoque Baixo";
      case "high":
        return "Estoque Alto";
      default:
        return "Normal";
    }
  };

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "active";
      case "inactive":
        return "inactive";
      case "discontinued":
        return "discontinued";
      default:
        return "unknown";
    }
  };

  const getStatusLabel = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "discontinued":
        return "Descontinuado";
      default:
        return status;
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="product-list-container">
      <div className="list-header">
        <h2>
          <FiPackage size={24} />
          Produtos
        </h2>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{products.length}</span>
          </div>
          <div className="stat-item alert">
            <span className="stat-label">Estoque Baixo</span>
            <span className="stat-value">
              {products.filter((p) => p.currentStock <= p.minStock).length}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="discontinued">Descontinuado</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} />
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Estoque Atual</th>
                <th>Estoque Mín.</th>
                <th>Preço Venda</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <span className="sku">{product.sku}</span>
                    </td>
                    <td>
                      <div className="product-info">
                        <span className="product-name">{product.name}</span>
                        {stockStatus === "low" || stockStatus === "out" ? (
                          <FiAlertTriangle size={16} className="warning-icon" />
                        ) : null}
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`stock-badge ${stockStatus}`}>
                        {product.currentStock} {product.unit}
                      </span>
                      <span className="stock-status-label">
                        {getStockStatusLabel(stockStatus)}
                      </span>
                    </td>
                    <td>
                      {product.minStock} {product.unit}
                    </td>
                    <td>{formatCurrency(product.unitPrice)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => onViewMovements(product)}
                          className="btn-action btn-view"
                          title="Ver Movimentações"
                        >
                          <FiPackage size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm("Deseja realmente excluir este produto?")
                            ) {
                              onDelete(product.id);
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
