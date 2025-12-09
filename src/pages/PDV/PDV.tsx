import React, { useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiDollarSign,
  FiX,
  FiPlus,
  FiMinus,
  FiSearch,
  FiFileText,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { getAllProducts } from "../../services/estoqueService";
import { searchCustomers } from "../../services/crmService";
import {
  getAllServices,
  createSale,
  getTodayCashRegister,
  openCashRegister,
  closeCashRegister,
  addSaleToCashRegister,
  getDailyReport,
} from "../../services/pdvService";
import type { Customer } from "../../types/crm";
import type { Product as EstoqueProduct } from "../../types/estoque";
import type {
  Product,
  Service,
  CartItem,
  PaymentMethod,
  Sale,
  CashRegister,
} from "../../types/pdv";
import "./PDV.css";

const PDV: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"venda" | "caixa" | "relatorio">("venda");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [estoqueProducts, setEstoqueProducts] = useState<EstoqueProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loadingCash, setLoadingCash] = useState(true);
  const [error, setError] = useState<string>("");

  // Converter produtos do estoque para formato PDV
  const products: Product[] = estoqueProducts
    .filter((p) => p.status === "active")
    .map((p) => ({
      id: `estoque_${p.id}`,
      name: p.name,
      price: p.unitPrice,
      category: p.category,
      stock: p.currentStock,
      description: p.description,
    }));

  // Carregar produtos do estoque
  useEffect(() => {
    const loadEstoqueProducts = async () => {
      try {
        setLoadingProducts(true);
        const produtos = await getAllProducts();
        setEstoqueProducts(produtos);
      } catch (error) {
        console.error("Erro ao carregar produtos do estoque:", error);
        setError("Erro ao carregar produtos");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadEstoqueProducts();
  }, []);

  // Carregar serviços
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const servicos = await getAllServices();
        setServices(servicos);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        setError("Erro ao carregar serviços");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // Buscar clientes ao digitar
  useEffect(() => {
    const searchCustomersAsync = async () => {
      if (customerSearch.trim().length >= 2) {
        try {
          const results = await searchCustomers(customerSearch);
          setCustomerResults(results);
          setShowCustomerResults(true);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
          setCustomerResults([]);
        }
      } else {
        setCustomerResults([]);
        setShowCustomerResults(false);
      }
    };

    const timeoutId = setTimeout(searchCustomersAsync, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearch]);

  // Carregar ou criar caixa do dia
  useEffect(() => {
    const loadCashRegister = async () => {
      if (!user?.uid) return;

      try {
        setLoadingCash(true);
        let cash = await getTodayCashRegister(user.uid);

        if (!cash) {
          // Criar novo caixa se não existir
          const cashId = await openCashRegister(
            user.uid,
            user.name || "",
            0
          );
          cash = await getTodayCashRegister(user.uid);
        }

        if (cash) {
          setCashRegister(cash);
        }
      } catch (error) {
        console.error("Erro ao carregar caixa:", error);
        setError("Erro ao carregar informações do caixa");
      } finally {
        setLoadingCash(false);
      }
    };

    loadCashRegister();
  }, [user]);

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredServices = services.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: Product | Service, type: "product" | "service") => {
    if (type === "product" && "stock" in item && item.stock <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    const existingItem = cart.find((c) => c.id === item.id && c.type === type);

    if (existingItem) {
      if (type === "product" && "stock" in item) {
        if (existingItem.quantity >= item.stock) {
          alert("Quantidade indisponível no estoque!");
          return;
        }
      }
      setCart(
        cart.map((c) =>
          c.id === item.id && c.type === type
            ? {
                ...c,
                quantity: c.quantity + 1,
                subtotal: (c.quantity + 1) * c.price,
              }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          type,
          name: item.name,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ]);
    }
  };

  // Função para recarregar produtos do estoque após vendas
  const reloadEstoqueProducts = async () => {
    try {
      const produtos = await getAllProducts();
      setEstoqueProducts(produtos);
    } catch (error) {
      console.error("Erro ao recarregar produtos do estoque:", error);
    }
  };

  const updateQuantity = (id: string, type: "product" | "service", delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id && item.type === type) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          
          if (type === "product") {
            const product = products.find((p) => p.id === id);
            if (product && newQuantity > product.stock) {
              alert("Quantidade indisponível no estoque!");
              return item;
            }
          }
          
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string, type: "product" | "service") => {
    setCart(cart.filter((item) => !(item.id === id && item.type === type)));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount;

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("Adicione itens ao carrinho antes de finalizar a venda!");
      return;
    }

    if (total <= 0) {
      alert("Total deve ser maior que zero!");
      return;
    }

    if (!user?.uid || !cashRegister) {
      alert("Erro: usuário ou caixa não encontrado!");
      return;
    }

    try {
      setError("");

      const saleData: Omit<Sale, "id"> = {
        date: new Date(),
        items: [...cart],
        subtotal,
        discount: discount > 0 ? discount : undefined,
        total,
        payment: {
          method: paymentMethod,
          amount: total,
        },
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        employeeId: user.uid,
        employeeName: user.name || "",
        status: "completed",
      };

      // Criar venda no Firestore (já atualiza o estoque automaticamente)
      const saleId = await createSale(saleData, user.uid);

      // Adicionar venda ao caixa
      const saleWithId: Sale = {
        ...saleData,
        id: saleId,
      };
      await addSaleToCashRegister(cashRegister.id, saleWithId);

      // Recarregar caixa atualizado
      const updatedCash = await getTodayCashRegister(user.uid);
      if (updatedCash) {
        setCashRegister(updatedCash);
      }

      // Recarregar produtos para atualizar estoque na tela
      await reloadEstoqueProducts();

      // Limpar carrinho
      setCart([]);
      setDiscount(0);
      setCustomerName("");
      setCustomerId(undefined);
      setCustomerSearch("");
      setCustomerResults([]);
      setShowCustomerResults(false);
      setPaymentMethod("pix");

      alert("Venda realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao finalizar venda. Tente novamente.";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleCloseCash = async () => {
    if (!cashRegister || cashRegister.status === "closed") {
      alert("Caixa já está fechado!");
      return;
    }

    if (!user?.uid) {
      alert("Erro: usuário não encontrado!");
      return;
    }

    try {
      setError("");

      const closingAmount = cashRegister.openingAmount + cashRegister.totalSales;
      await closeCashRegister(cashRegister.id, closingAmount);

      // Recarregar caixa atualizado
      const updatedCash = await getTodayCashRegister(user.uid);
      if (updatedCash) {
        setCashRegister(updatedCash);
      }

      alert("Caixa fechado com sucesso!");
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao fechar caixa. Tente novamente.";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const getTodaySales = () => {
    if (!cashRegister) return [];
    return cashRegister.sales;
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <h1 className="pdv-title">PDV - Ponto de Venda</h1>
        <p className="pdv-subtitle">Gerencie vendas, pagamentos e caixa</p>
        {error && (
          <div className="pdv-error-message" style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}
      </div>

      <div className="pdv-tabs">
        <button
          className={`pdv-tab ${activeTab === "venda" ? "active" : ""}`}
          onClick={() => setActiveTab("venda")}
        >
          <FiShoppingCart size={18} />
          Nova Venda
        </button>
        <button
          className={`pdv-tab ${activeTab === "caixa" ? "active" : ""}`}
          onClick={() => setActiveTab("caixa")}
        >
          <FiDollarSign size={18} />
          Gerenciamento de Caixa
        </button>
        <button
          className={`pdv-tab ${activeTab === "relatorio" ? "active" : ""}`}
          onClick={() => setActiveTab("relatorio")}
        >
          <FiFileText size={18} />
          Relatórios
        </button>
      </div>

      {activeTab === "venda" && (
        <div className="pdv-content">
          <div className="pdv-left">
            <div className="pdv-search">
              <FiSearch className="pdv-search-icon" />
              <input
                type="text"
                placeholder="Buscar produtos ou serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pdv-search-input"
              />
            </div>

            <div className="pdv-items">
              <div className="pdv-section">
                <div className="pdv-section-header">
                  <h3 className="pdv-section-title">Produtos</h3>
                  {loadingProducts && (
                    <span className="pdv-loading-text">Carregando produtos...</span>
                  )}
                </div>
                {filteredProducts.length === 0 && !loadingProducts ? (
                  <p className="pdv-no-items">Nenhum produto encontrado</p>
                ) : (
                  <div className="pdv-items-grid">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="pdv-item-card">
                        <div className="pdv-item-info">
                          <h4 className="pdv-item-name">{product.name}</h4>
                          <p className="pdv-item-category">{product.category}</p>
                          <p className="pdv-item-price">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </p>
                          <p className={`pdv-item-stock ${product.stock === 0 ? "out-of-stock" : ""}`}>
                            Estoque: {product.stock}
                          </p>
                          {product.description && (
                            <p className="pdv-item-description">{product.description}</p>
                          )}
                        </div>
                        <button
                          className="pdv-add-button"
                          onClick={() => addToCart(product, "product")}
                          disabled={product.stock === 0}
                        >
                          <FiPlus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pdv-section">
                <div className="pdv-section-header">
                  <h3 className="pdv-section-title">Serviços</h3>
                  {loadingServices && (
                    <span className="pdv-loading-text">Carregando serviços...</span>
                  )}
                </div>
                {filteredServices.length === 0 && !loadingServices ? (
                  <p className="pdv-no-items">Nenhum serviço encontrado</p>
                ) : (
                  <div className="pdv-items-grid">
                    {filteredServices.map((service) => (
                    <div key={service.id} className="pdv-item-card">
                      <div className="pdv-item-info">
                        <h4 className="pdv-item-name">{service.name}</h4>
                        <p className="pdv-item-category">{service.category}</p>
                        <p className="pdv-item-price">
                          R$ {service.price.toFixed(2).replace(".", ",")}
                        </p>
                        {service.duration && (
                          <p className="pdv-item-duration">
                            <FiClock size={14} /> {service.duration} min
                          </p>
                        )}
                      </div>
                      <button
                        className="pdv-add-button"
                        onClick={() => addToCart(service, "service")}
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pdv-right">
            <div className="pdv-cart">
              <h3 className="pdv-cart-title">Carrinho</h3>
              <div className="pdv-cart-items">
                {cart.length === 0 ? (
                  <p className="pdv-cart-empty">Carrinho vazio</p>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.id}-${item.type}`} className="pdv-cart-item">
                      <div className="pdv-cart-item-info">
                        <h4 className="pdv-cart-item-name">{item.name}</h4>
                        <p className="pdv-cart-item-price">
                          R$ {item.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="pdv-cart-item-controls">
                        <button
                          className="pdv-quantity-button"
                          onClick={() => updateQuantity(item.id, item.type, -1)}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="pdv-quantity">{item.quantity}</span>
                        <button
                          className="pdv-quantity-button"
                          onClick={() => updateQuantity(item.id, item.type, 1)}
                        >
                          <FiPlus size={14} />
                        </button>
                        <button
                          className="pdv-remove-button"
                          onClick={() => removeFromCart(item.id, item.type)}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      <p className="pdv-cart-item-subtotal">
                        R$ {item.subtotal.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pdv-cart-summary">
                <div className="pdv-summary-row">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="pdv-summary-row">
                  <input
                    type="number"
                    placeholder="Desconto"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="pdv-discount-input"
                    min="0"
                    max={subtotal}
                  />
                  <span>R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="pdv-summary-row pdv-total">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <div className="pdv-payment-section">
                <h4 className="pdv-payment-title">Método de Pagamento</h4>
                <div className="pdv-payment-methods">
                  <button
                    className={`pdv-payment-button ${paymentMethod === "pix" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("pix")}
                  >
                    PIX
                  </button>
                  <button
                    className={`pdv-payment-button ${paymentMethod === "debito" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("debito")}
                  >
                    Débito
                  </button>
                  <button
                    className={`pdv-payment-button ${paymentMethod === "credito" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("credito")}
                  >
                    Crédito
                  </button>
                  <button
                    className={`pdv-payment-button ${paymentMethod === "dinheiro" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("dinheiro")}
                  >
                    Dinheiro
                  </button>
                </div>

                <div className="pdv-customer-section">
                  <div className="pdv-customer-search-wrapper">
                    <input
                      type="text"
                      placeholder="Buscar cliente por nome, telefone ou email..."
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        if (e.target.value.trim().length === 0) {
                          setCustomerName("");
                          setCustomerId(undefined);
                        }
                      }}
                      onFocus={() => {
                        if (customerResults.length > 0) {
                          setShowCustomerResults(true);
                        }
                      }}
                      className="pdv-customer-input"
                    />
                    {showCustomerResults && customerResults.length > 0 && (
                      <div className="pdv-customer-results">
                        {customerResults.map((customer) => (
                          <div
                            key={customer.id}
                            className="pdv-customer-result-item"
                            onClick={() => {
                              setCustomerName(customer.name);
                              setCustomerId(customer.id);
                              setCustomerSearch(customer.name);
                              setShowCustomerResults(false);
                            }}
                          >
                            <div className="pdv-customer-result-name">
                              {customer.name}
                            </div>
                            <div className="pdv-customer-result-info">
                              {customer.phone && (
                                <span>{customer.phone}</span>
                              )}
                              {customer.email && (
                                <span>{customer.email}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {customerName && (
                    <div className="pdv-selected-customer">
                      Cliente selecionado: <strong>{customerName}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerName("");
                          setCustomerId(undefined);
                          setCustomerSearch("");
                        }}
                        className="pdv-clear-customer"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <button className="pdv-finish-button" onClick={handlePayment}>
                  <FiDollarSign size={18} />
                  Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "caixa" && (
        <div className="pdv-cash-section">
          {loadingCash ? (
            <p>Carregando informações do caixa...</p>
          ) : cashRegister ? (
            <div className="pdv-cash-info">
              <div className="pdv-cash-card">
                <h3 className="pdv-cash-card-title">Informações do Caixa</h3>
                <div className="pdv-cash-details">
                  <div className="pdv-cash-detail">
                    <span className="pdv-cash-label">Data:</span>
                    <span className="pdv-cash-value">
                      {new Date(cashRegister.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="pdv-cash-detail">
                    <span className="pdv-cash-label">Status:</span>
                    <span
                      className={`pdv-cash-status ${
                        cashRegister.status === "open" ? "open" : "closed"
                      }`}
                    >
                      {cashRegister.status === "open" ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                  <div className="pdv-cash-detail">
                    <span className="pdv-cash-label">Valor de Abertura:</span>
                    <span className="pdv-cash-value">
                      R$ {cashRegister.openingAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="pdv-cash-detail">
                    <span className="pdv-cash-label">Total de Vendas:</span>
                    <span className="pdv-cash-value">
                      R$ {cashRegister.totalSales.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  {cashRegister.closingAmount !== undefined && (
                    <div className="pdv-cash-detail">
                      <span className="pdv-cash-label">Valor de Fechamento:</span>
                      <span className="pdv-cash-value">
                        R$ {cashRegister.closingAmount.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pdv-payments-breakdown">
                  <h4 className="pdv-breakdown-title">Pagamentos por Método</h4>
                  <div className="pdv-breakdown-grid">
                    <div className="pdv-breakdown-item">
                      <span>PIX:</span>
                      <span>R$ {cashRegister.totalPayments.pix.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="pdv-breakdown-item">
                      <span>Débito:</span>
                      <span>
                        R$ {cashRegister.totalPayments.debito.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="pdv-breakdown-item">
                      <span>Crédito:</span>
                      <span>
                        R$ {cashRegister.totalPayments.credito.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="pdv-breakdown-item">
                      <span>Dinheiro:</span>
                      <span>
                        R$ {cashRegister.totalPayments.dinheiro.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>

                {cashRegister.status === "open" && (
                  <button className="pdv-close-cash-button" onClick={handleCloseCash}>
                    <FiX size={18} />
                    Fechar Caixa
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p>Nenhum caixa encontrado para hoje. Um novo caixa será criado automaticamente.</p>
          )}
          {error && <p className="pdv-error">{error}</p>}
        </div>
      )}

      {activeTab === "relatorio" && (
        <div className="pdv-report-section">
          <h3 className="pdv-report-title">Relatório Diário</h3>
          <div className="pdv-report-content">
            <div className="pdv-report-summary">
              <div className="pdv-report-card">
                <h4>Total de Vendas</h4>
                <p className="pdv-report-value">
                  R$ {cashRegister?.totalSales.toFixed(2).replace(".", ",") || "0,00"}
                </p>
              </div>
              <div className="pdv-report-card">
                <h4>Número de Transações</h4>
                <p className="pdv-report-value">
                  {cashRegister?.sales.length || 0}
                </p>
              </div>
            </div>

            <div className="pdv-sales-list">
              <h4 className="pdv-sales-list-title">Vendas do Dia</h4>
              {getTodaySales().length === 0 ? (
                <p className="pdv-no-sales">Nenhuma venda registrada hoje</p>
              ) : (
                <div className="pdv-sales-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Itens</th>
                        <th>Total</th>
                        <th>Pagamento</th>
                        <th>Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTodaySales().map((sale) => (
                        <tr key={sale.id}>
                          <td>{new Date(sale.date).toLocaleTimeString("pt-BR")}</td>
                          <td>{sale.items.length} itens</td>
                          <td>R$ {sale.total.toFixed(2).replace(".", ",")}</td>
                          <td>{sale.payment.method.toUpperCase()}</td>
                          <td>{sale.customerName || "Não informado"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDV;

