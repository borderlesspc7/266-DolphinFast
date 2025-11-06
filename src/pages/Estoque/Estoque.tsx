import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiBarChart2,
} from "react-icons/fi";
import ProductForm from "../../components/estoque/ProductForm";
import ProductList from "../../components/estoque/ProductList";
import StockMovementSection from "../../components/estoque/StockMovementSection";
import StockAlertsSection from "../../components/estoque/StockAlertsSection";
import type {
  Product,
  ProductFormData,
  StockMovement,
  StockMovementFormData,
  StockAlert,
  InventoryReport,
} from "../../types/estoque";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  createStockMovement,
  getStockMovements,
  deleteStockMovement,
  getStockAlerts,
  updateAlertStatus,
  getInventoryReport,
} from "../../services/estoqueService";
import "./Estoque.css";

const Estoque: React.FC = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [reportData, setReportData] = useState<InventoryReport | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadProducts();
    loadAlerts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch {
      setError("Erro ao carregar produtos");
    }
  };

  const loadMovements = async (
    productId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const data = await getStockMovements(productId, startDate, endDate);
      setMovements(data);
    } catch {
      setError("Erro ao carregar movimentações");
    }
  };

  const loadAlerts = async (status?: "active" | "resolved" | "ignored") => {
    try {
      const data = await getStockAlerts(status);
      setAlerts(data);
    } catch {
      setError("Erro ao carregar alertas");
    }
  };

  const loadReport = async () => {
    try {
      const data = await getInventoryReport();
      setReportData(data);
    } catch {
      setError("Erro ao carregar relatório");
    }
  };

  // Produtos
  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      setError("");
      setSuccessMessage("");

      // Validações
      if (!data.name || data.name.trim() === "") {
        setError("O nome do produto é obrigatório");
        return;
      }

      if (!data.sku || data.sku.trim() === "") {
        setError("O SKU é obrigatório");
        return;
      }

      if (!data.category || data.category.trim() === "") {
        setError("A categoria é obrigatória");
        return;
      }

      if (data.currentStock < 0) {
        setError("O estoque atual não pode ser negativo");
        return;
      }

      if (data.minStock < 0) {
        setError("O estoque mínimo não pode ser negativo");
        return;
      }

      if (data.maxStock < 0) {
        setError("O estoque máximo não pode ser negativo");
        return;
      }

      if (data.minStock > data.maxStock && data.maxStock > 0) {
        setError("O estoque mínimo não pode ser maior que o estoque máximo");
        return;
      }

      if (data.costPrice < 0) {
        setError("O preço de custo não pode ser negativo");
        return;
      }

      if (data.unitPrice < 0) {
        setError("O preço de venda não pode ser negativo");
        return;
      }

      if (!data.supplier || data.supplier.trim() === "") {
        setError("O fornecedor é obrigatório");
        return;
      }

      // Verificar se já existe um produto com o mesmo SKU
      const existingProducts = await getAllProducts();
      const skuExists = existingProducts.some(
        (p) => p.sku.toLowerCase() === data.sku.toLowerCase()
      );

      if (skuExists) {
        setError("Já existe um produto com este SKU");
        return;
      }

      // Criar o produto
      await createProduct(data);
      
      // Recarregar dados
      await loadProducts();
      await loadAlerts();
      
      // Mostrar mensagem de sucesso
      setSuccessMessage("Produto criado com sucesso!");
      
      // Fechar formulário após um breve delay
      setTimeout(() => {
        setShowProductForm(false);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar produto. Tente novamente."
      );
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, data);
      await loadProducts();
      await loadAlerts();
      setShowProductForm(false);
      setEditingProduct(undefined);
    } catch {
      setError("Erro ao atualizar produto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch {
      setError("Erro ao deletar produto");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleViewMovements = (product: Product) => {
    setActiveTab("movements");
    loadMovements(product.id);
  };

  // Movimentações
  const handleCreateMovement = async (data: StockMovementFormData) => {
    try {
      await createStockMovement(data);
      await loadMovements();
      await loadProducts();
      await loadAlerts();
    } catch {
      setError("Erro ao criar movimentação");
    }
  };

  const handleDeleteMovement = async (id: string) => {
    try {
      await deleteStockMovement(id);
      await loadMovements();
    } catch {
      setError("Erro ao deletar movimentação");
    }
  };

  // Alertas
  const handleUpdateAlertStatus = async (
    id: string,
    status: "active" | "resolved" | "ignored"
  ) => {
    try {
      await updateAlertStatus(id, status);
      await loadAlerts();
    } catch {
      setError("Erro ao atualizar status do alerta");
    }
  };

  const tabs = [
    {
      id: "products",
      label: "Produtos",
      icon: FiPackage,
      count: products.length,
    },
    {
      id: "movements",
      label: "Movimentações",
      icon: FiTrendingUp,
      count: movements.length,
    },
    {
      id: "alerts",
      label: "Alertas",
      icon: FiAlertTriangle,
      count: alerts.filter((a) => a.status === "active").length,
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FiBarChart2,
      count: 0,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="estoque-page">
      <div className="page-header">
        <h1>Gestão de Estoque</h1>
        <p>Controle completo do inventário, movimentações e alertas</p>
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

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "reports" && !reportData) {
                  loadReport();
                }
              }}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "products" && (
          <div className="products-tab">
            {showProductForm ? (
              <ProductForm
                product={editingProduct}
                onSubmit={
                  editingProduct ? handleUpdateProduct : handleCreateProduct
                }
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(undefined);
                }}
              />
            ) : (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onViewMovements={handleViewMovements}
                onAddNew={() => setShowProductForm(true)}
              />
            )}
          </div>
        )}

        {activeTab === "movements" && (
          <StockMovementSection
            products={products}
            movements={movements}
            onCreateMovement={handleCreateMovement}
            onDeleteMovement={handleDeleteMovement}
            onLoadMovements={loadMovements}
          />
        )}

        {activeTab === "alerts" && (
          <StockAlertsSection
            products={products}
            alerts={alerts}
            onLoadAlerts={loadAlerts}
            onUpdateAlertStatus={handleUpdateAlertStatus}
          />
        )}

        {activeTab === "reports" && (
          <div className="reports-tab">
            {reportData ? (
              <div className="reports-container">
                <div className="report-summary">
                  <div className="summary-card">
                    <div className="card-icon">
                      <FiPackage size={32} />
                    </div>
                    <div className="card-content">
                      <h3>Total de Produtos</h3>
                      <p className="card-value">{reportData.totalProducts}</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="card-icon">
                      <FiBarChart2 size={32} />
                    </div>
                    <div className="card-content">
                      <h3>Valor Total do Estoque</h3>
                      <p className="card-value">
                        {formatCurrency(reportData.totalValue)}
                      </p>
                    </div>
                  </div>

                  <div className="summary-card alert">
                    <div className="card-icon">
                      <FiAlertTriangle size={32} />
                    </div>
                    <div className="card-content">
                      <h3>Produtos com Estoque Baixo</h3>
                      <p className="card-value">{reportData.lowStockItems}</p>
                    </div>
                  </div>

                  <div className="summary-card critical">
                    <div className="card-icon">
                      <FiAlertTriangle size={32} />
                    </div>
                    <div className="card-content">
                      <h3>Produtos Sem Estoque</h3>
                      <p className="card-value">{reportData.outOfStockItems}</p>
                    </div>
                  </div>
                </div>

                <div className="report-sections">
                  <div className="report-section">
                    <h3>Produtos Mais Vendidos</h3>
                    {reportData.topSellingProducts.length > 0 ? (
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Quantidade Vendida</th>
                            <th>Receita Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.topSellingProducts.map(
                            (item, index: number) => (
                              <tr key={index}>
                                <td>{item.productName}</td>
                                <td>{item.quantitySold}</td>
                                <td>{formatCurrency(item.totalRevenue)}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <p>Nenhuma venda registrada</p>
                    )}
                  </div>

                  <div className="report-section">
                    <h3>Estoque por Categoria</h3>
                    {reportData.stockByCategory.length > 0 ? (
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Categoria</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.stockByCategory.map(
                            (item, index: number) => (
                              <tr key={index}>
                                <td>{item.category}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.value)}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <p>Nenhuma categoria cadastrada</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando relatório...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Estoque;
