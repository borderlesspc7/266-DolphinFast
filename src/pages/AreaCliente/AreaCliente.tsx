import React, { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiEdit2, FiX, FiSave, FiClock, FiShoppingBag, FiGift, FiMapPin, FiPhone, FiMail, FiUser } from "react-icons/fi";
import * as crmService from "../../services/crmService";
import { getCustomerPurchases, getCustomerServices } from "../../services/pdvService";
import type { Customer } from "../../types/crm";
import "./AreaCliente.css";

const AreaCliente: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<Partial<Customer>>({});
  const [customerHistory, setCustomerHistory] = useState<{
    purchases: Array<{ id: string; date: string; service: string; amount: number; status: string }>;
    services: Array<{ id: string; date: string; type: string; description: string; status: string }>;
  }>({ purchases: [], services: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter((customer) => {
        const nameMatch = customer.name.toLowerCase().includes(term);
        const phoneMatch = customer.phone?.toLowerCase().includes(term);
        const emailMatch = customer.email?.toLowerCase().includes(term);
        const cpfMatch = customer.cpf?.toLowerCase().includes(term);
        return nameMatch || phoneMatch || emailMatch || cpfMatch;
      });
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError("Não foi possível carregar os clientes. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
    setEditingData({});
    setLoadingHistory(true);

    try {
      const [purchases, services] = await Promise.all([
        getCustomerPurchases(customer.id),
        getCustomerServices(customer.id),
      ]);
      setCustomerHistory({ purchases, services });
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setCustomerHistory({ purchases: [], services: [] });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEdit = () => {
    if (selectedCustomer) {
      setIsEditing(true);
      setEditingData({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        whatsapp: selectedCustomer.whatsapp,
        cpf: selectedCustomer.cpf,
        birthDate: selectedCustomer.birthDate,
        address: selectedCustomer.address,
        preferences: selectedCustomer.preferences,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedCustomer) return;

    try {
      setLoading(true);
      await crmService.updateCustomer(selectedCustomer.id, editingData);
      await loadCustomers();
      
      // Atualizar cliente selecionado
      const updated = await crmService.getCustomer(selectedCustomer.id);
      if (updated) {
        setSelectedCustomer(updated);
      }
      
      setIsEditing(false);
      setEditingData({});
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      setError("Não foi possível atualizar o cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingData({});
  };

  const handleBack = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    setEditingData({});
    setCustomerHistory({ purchases: [], services: [] });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="area-cliente-page">
        <div className="area-cliente-header">
          <h1 className="area-cliente-title">Área do Cliente</h1>
          <p className="area-cliente-subtitle">
            Gerencie informações e histórico dos clientes
          </p>
        </div>
        <div className="area-cliente-loading">
          <div className="spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error && customers.length === 0) {
    return (
      <div className="area-cliente-page">
        <div className="area-cliente-header">
          <h1 className="area-cliente-title">Área do Cliente</h1>
          <p className="area-cliente-subtitle">
            Gerencie informações e histórico dos clientes
          </p>
        </div>
        <div className="area-cliente-error">
          <p>{error}</p>
          <button className="btn-retry" onClick={loadCustomers}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="area-cliente-page">
        <div className="area-cliente-header">
          <div>
            <h1 className="area-cliente-title">Detalhes do Cliente</h1>
            <p className="area-cliente-subtitle">
              Informações completas e histórico de transações
            </p>
          </div>
          <button className="btn-back" onClick={handleBack}>
            <FiX size={18} />
            Voltar
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="customer-details-view">
          <div className="customer-details-card">
            <div className="details-header">
              <div className="customer-avatar">
                <FiUser size={32} />
              </div>
              <div className="customer-name-section">
                <h2>{selectedCustomer.name}</h2>
                <div className="customer-status">
                  <span className={`status-badge ${selectedCustomer.active ? "active" : "inactive"}`}>
                    {selectedCustomer.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button className="btn-edit" onClick={handleEdit}>
                  <FiEdit2 size={18} />
                  Editar
                </button>
              )}
              {isEditing && (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave} disabled={loading}>
                    <FiSave size={18} />
                    Salvar
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    <FiX size={18} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h3>
                  <FiUser size={18} />
                  Informações Pessoais
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nome Completo</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="detail-input"
                        value={editingData.name || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, name: e.target.value })
                        }
                      />
                    ) : (
                      <span className="detail-value">{selectedCustomer.name}</span>
                    )}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <FiMail size={14} />
                      Email
                    </span>
                    {isEditing ? (
                      <input
                        type="email"
                        className="detail-input"
                        value={editingData.email || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, email: e.target.value })
                        }
                      />
                    ) : (
                      <span className="detail-value">{selectedCustomer.email}</span>
                    )}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <FiPhone size={14} />
                      Telefone
                    </span>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="detail-input"
                        value={editingData.phone || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <span className="detail-value">{selectedCustomer.phone}</span>
                    )}
                  </div>
                  {selectedCustomer.whatsapp && (
                    <div className="detail-item">
                      <span className="detail-label">WhatsApp</span>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="detail-input"
                          value={editingData.whatsapp || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, whatsapp: e.target.value })
                          }
                        />
                      ) : (
                        <span className="detail-value">{selectedCustomer.whatsapp}</span>
                      )}
                    </div>
                  )}
                  {selectedCustomer.cpf && (
                    <div className="detail-item">
                      <span className="detail-label">CPF</span>
                      <span className="detail-value">{selectedCustomer.cpf}</span>
                    </div>
                  )}
                  {selectedCustomer.birthDate && (
                    <div className="detail-item">
                      <span className="detail-label">Data de Nascimento</span>
                      <span className="detail-value">
                        {new Date(selectedCustomer.birthDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedCustomer.address && (
                <div className="detail-section">
                  <h3>
                    <FiMapPin size={18} />
                    Endereço
                  </h3>
                  <div className="address-text">
                    {selectedCustomer.address.street}, {selectedCustomer.address.number}
                    {selectedCustomer.address.complement && ` - ${selectedCustomer.address.complement}`}
                    <br />
                    {selectedCustomer.address.neighborhood}, {selectedCustomer.address.city} - {selectedCustomer.address.state}
                    <br />
                    CEP: {selectedCustomer.address.zipCode}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>
                  <FiGift size={18} />
                  Programa de Fidelidade
                </h3>
                <div className="loyalty-info">
                  <div className="loyalty-card">
                    <span className="loyalty-label">Pontos Disponíveis</span>
                    <span className="loyalty-value">{selectedCustomer.loyaltyPoints}</span>
                  </div>
                  <div className="loyalty-card">
                    <span className="loyalty-label">Total de Compras</span>
                    <span className="loyalty-value">{selectedCustomer.totalPurchases}</span>
                  </div>
                </div>
              </div>

              {selectedCustomer.preferences?.observations && (
                <div className="detail-section">
                  <h3>Observações</h3>
                  <p className="observations-text">{selectedCustomer.preferences.observations}</p>
                </div>
              )}
            </div>
          </div>

          <div className="customer-history-section">
            <h2 className="history-title">
              <FiClock size={24} />
              Histórico de Transações
            </h2>

            {loadingHistory ? (
              <div className="history-loading">
                <div className="spinner-small"></div>
                <p>Carregando histórico...</p>
              </div>
            ) : (
              <>
                <div className="history-subsection">
                  <h3>
                    <FiShoppingBag size={20} />
                    Compras Realizadas
                  </h3>
                  {customerHistory.purchases.length > 0 ? (
                    <div className="history-table-container">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Serviço</th>
                            <th>Valor</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerHistory.purchases.map((purchase) => (
                            <tr key={purchase.id}>
                              <td>
                                <div className="history-date">
                                  <FiClock size={14} />
                                  <span>{new Date(purchase.date).toLocaleDateString("pt-BR")}</span>
                                </div>
                              </td>
                              <td>{purchase.service}</td>
                              <td className="history-amount">
                                R$ {purchase.amount.toFixed(2).replace(".", ",")}
                              </td>
                              <td>
                                <span className={`history-status history-status-${purchase.status.toLowerCase()}`}>
                                  {purchase.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="history-empty">
                      Nenhuma compra encontrada
                    </div>
                  )}
                </div>

                <div className="history-subsection">
                  <h3>Serviços Contratados</h3>
                  {customerHistory.services.length > 0 ? (
                    <div className="history-services-list">
                      {customerHistory.services.map((service) => (
                        <div key={service.id} className="history-service-card">
                          <div className="history-service-header">
                            <div className="history-service-info">
                              <h4 className="history-service-type">{service.type}</h4>
                              <p className="history-service-description">{service.description}</p>
                            </div>
                            <span className={`history-status history-status-${service.status.toLowerCase()}`}>
                              {service.status}
                            </span>
                          </div>
                          <div className="history-service-footer">
                            <span className="history-service-date">
                              <FiClock size={14} />
                              {new Date(service.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="history-empty">
                      Nenhum serviço encontrado
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="area-cliente-page">
      <div className="area-cliente-header">
        <div>
          <h1 className="area-cliente-title">Área do Cliente</h1>
          <p className="area-cliente-subtitle">
            Gerencie informações e histórico dos clientes
          </p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="search-section">
        <div className="search-box">
          <FiSearch size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="customers-count">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? "cliente encontrado" : "clientes encontrados"}
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="customer-card"
              onClick={() => handleSelectCustomer(customer)}
            >
              <div className="customer-card-header">
                <div className="customer-card-avatar">
                  <FiUser size={24} />
                </div>
                <div className="customer-card-info">
                  <h3 className="customer-card-name">{customer.name}</h3>
                  <span className={`customer-card-status ${customer.active ? "active" : "inactive"}`}>
                    {customer.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <div className="customer-card-details">
                <div className="customer-card-detail-item">
                  <FiMail size={14} />
                  <span>{customer.email}</span>
                </div>
                <div className="customer-card-detail-item">
                  <FiPhone size={14} />
                  <span>{customer.phone}</span>
                </div>
                <div className="customer-card-loyalty">
                  <FiGift size={14} />
                  <span>{customer.loyaltyPoints} pontos</span>
                  <span className="separator">•</span>
                  <span>{customer.totalPurchases} compras</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FiUsers size={48} />
            <p>Nenhum cliente encontrado</p>
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm("")}>
                Limpar busca
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaCliente;

