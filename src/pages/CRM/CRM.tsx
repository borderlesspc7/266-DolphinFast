import React, { useState, useEffect } from "react";
import { FiUsers, FiGift, FiSend } from "react-icons/fi";
import CustomerForm from "../../components/crm/CustomerForm";
import CustomerList from "../../components/crm/CustomerList";
import LoyaltySection from "../../components/crm/LoyaltySection";
import CommunicationSection from "../../components/crm/CommunicationSection";
import type {
  Customer,
  CustomerFormData,
  LoyaltyProgram,
  Promotion,
  Communication,
} from "../../types/crm";
import * as crmService from "../../services/crmService";
import "./CRM.css";

type CRMTab = "customers" | "loyalty" | "communication";

const CRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>("customers");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(
    undefined
  );
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >(undefined);

  // Estados para dados
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carregar dados
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // timeout de segurança para não travar o loading
      const timeoutId = setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 15000);

      try {
        setLoading(true);
        const results = await Promise.allSettled([
          crmService.getAllCustomers(),
          crmService.getAllLoyaltyPrograms(),
          crmService.getAllPromotions(),
          crmService.getAllCommunications(),
        ]);

        if (!cancelled) {
          const [c, p1, p2, comm] = results;
          if (c.status === "fulfilled") setCustomers(c.value);
          if (p1.status === "fulfilled") setLoyaltyPrograms(p1.value);
          if (p2.status === "fulfilled") setPromotions(p2.value);
          if (comm.status === "fulfilled") setCommunications(comm.value);
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar dados do CRM");
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (!cancelled) {
        // limpar timeout se terminou antes
        clearTimeout(timeoutId);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersData, programsData, promotionsData, communicationsData] =
        await Promise.all([
          crmService.getAllCustomers(),
          crmService.getAllLoyaltyPrograms(),
          crmService.getAllPromotions(),
          crmService.getAllCommunications(),
        ]);

      setCustomers(customersData);
      setLoyaltyPrograms(programsData);
      setPromotions(promotionsData);
      setCommunications(communicationsData);
    } catch (err) {
      setError("Erro ao carregar dados do CRM");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Funções de Clientes
  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      await crmService.createCustomer(data);
      await loadData();
      setShowCustomerForm(false);
    } catch {
      throw new Error("Erro ao criar cliente");
    }
  };

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editingCustomer) return;
    try {
      await crmService.updateCustomer(editingCustomer.id, data);
      await loadData();
      setEditingCustomer(undefined);
      setShowCustomerForm(false);
    } catch {
      throw new Error("Erro ao atualizar cliente");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await crmService.deleteCustomer(id);
      await loadData();
    } catch {
      alert("Erro ao excluir cliente");
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
    setSelectedCustomer(undefined);
  };

  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(false);
    setEditingCustomer(undefined);
  };

  // Funções de Fidelização
  const handleCreateLoyaltyProgram = async (
    program: Omit<LoyaltyProgram, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await crmService.createLoyaltyProgram(program);
      await loadData();
    } catch {
      alert("Erro ao criar programa de fidelidade");
    }
  };

  const handleToggleLoyaltyProgram = async (id: string, active: boolean) => {
    try {
      await crmService.updateLoyaltyProgram(id, { active });
      await loadData();
    } catch {
      alert("Erro ao atualizar programa");
    }
  };

  const handleCreatePromotion = async (
    promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await crmService.createPromotion(promotion);
      await loadData();
    } catch {
      alert("Erro ao criar promoção");
    }
  };

  const handleTogglePromotion = async (id: string, active: boolean) => {
    try {
      await crmService.updatePromotion(id, { active });
      await loadData();
    } catch {
      alert("Erro ao atualizar promoção");
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      await crmService.deletePromotion(id);
      await loadData();
    } catch {
      alert("Erro ao excluir promoção");
    }
  };

  // Funções de Comunicação
  const handleCreateCommunication = async (
    communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await crmService.createCommunication(communication);
      await loadData();
    } catch {
      alert("Erro ao criar comunicação");
    }
  };

  const handleSendCommunication = async (id: string) => {
    try {
      await crmService.sendCommunication(id);
      await loadData();
      alert("Comunicação enviada com sucesso!");
    } catch {
      alert("Erro ao enviar comunicação");
    }
  };

  const handleDeleteCommunication = async (id: string) => {
    try {
      await crmService.deleteCommunication(id);
      await loadData();
    } catch {
      alert("Erro ao excluir comunicação");
    }
  };

  return (
    <div className="crm-page">
      <div className="crm-header">
        <h1>CRM - Gestão de Relacionamento com o Cliente</h1>
        <p className="crm-subtitle">
          Gerencie clientes, programas de fidelidade e campanhas de comunicação
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="crm-tabs">
        <button
          className={activeTab === "customers" ? "tab-btn active" : "tab-btn"}
          onClick={() => {
            setActiveTab("customers");
            setShowCustomerForm(false);
            setEditingCustomer(undefined);
            setSelectedCustomer(undefined);
          }}
        >
          <FiUsers /> Clientes
        </button>
        <button
          className={activeTab === "loyalty" ? "tab-btn active" : "tab-btn"}
          onClick={() => {
            setActiveTab("loyalty");
            setShowCustomerForm(false);
            setEditingCustomer(undefined);
            setSelectedCustomer(undefined);
          }}
        >
          <FiGift /> Fidelização
        </button>
        <button
          className={
            activeTab === "communication" ? "tab-btn active" : "tab-btn"
          }
          onClick={() => {
            setActiveTab("communication");
            setShowCustomerForm(false);
            setEditingCustomer(undefined);
            setSelectedCustomer(undefined);
          }}
        >
          <FiSend /> Comunicação
        </button>
      </div>

      <div className="crm-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            {activeTab === "customers" && (
              <div className="customers-section">
                {!showCustomerForm && !selectedCustomer && (
                  <>
                    <div className="section-actions">
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setShowCustomerForm(true);
                          setEditingCustomer(undefined);
                        }}
                      >
                        + Adicionar Cliente
                      </button>
                    </div>
                    <CustomerList
                      customers={customers}
                      onEdit={handleEditCustomer}
                      onDelete={handleDeleteCustomer}
                      onViewDetails={handleViewCustomerDetails}
                    />
                  </>
                )}

                {showCustomerForm && (
                  <CustomerForm
                    customer={editingCustomer}
                    onSubmit={
                      editingCustomer
                        ? handleUpdateCustomer
                        : handleCreateCustomer
                    }
                    onCancel={() => {
                      setShowCustomerForm(false);
                      setEditingCustomer(undefined);
                    }}
                  />
                )}

                {selectedCustomer && (
                  <div className="customer-details">
                    <div className="details-header">
                      <h2>Detalhes do Cliente</h2>
                      <button
                        className="btn-back"
                        onClick={() => setSelectedCustomer(undefined)}
                      >
                        ← Voltar
                      </button>
                    </div>
                    <div className="details-content">
                      <div className="detail-section">
                        <h3>Informações Pessoais</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Nome:</span>
                            <span className="detail-value">
                              {selectedCustomer.name}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">E-mail:</span>
                            <span className="detail-value">
                              {selectedCustomer.email}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Telefone:</span>
                            <span className="detail-value">
                              {selectedCustomer.phone}
                            </span>
                          </div>
                          {selectedCustomer.whatsapp && (
                            <div className="detail-item">
                              <span className="detail-label">WhatsApp:</span>
                              <span className="detail-value">
                                {selectedCustomer.whatsapp}
                              </span>
                            </div>
                          )}
                          {selectedCustomer.cpf && (
                            <div className="detail-item">
                              <span className="detail-label">CPF:</span>
                              <span className="detail-value">
                                {selectedCustomer.cpf}
                              </span>
                            </div>
                          )}
                          {selectedCustomer.birthDate && (
                            <div className="detail-item">
                              <span className="detail-label">
                                Data de Nascimento:
                              </span>
                              <span className="detail-value">
                                {new Date(
                                  selectedCustomer.birthDate
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h3>Fidelidade</h3>
                        <div className="loyalty-info">
                          <div className="loyalty-card">
                            <span className="loyalty-label">
                              Pontos Acumulados
                            </span>
                            <span className="loyalty-value">
                              {selectedCustomer.loyaltyPoints}
                            </span>
                          </div>
                          <div className="loyalty-card">
                            <span className="loyalty-label">
                              Total de Compras
                            </span>
                            <span className="loyalty-value">
                              R$ {selectedCustomer.totalPurchases.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedCustomer.address && (
                        <div className="detail-section">
                          <h3>Endereço</h3>
                          <p className="address-text">
                            {selectedCustomer.address.street},{" "}
                            {selectedCustomer.address.number}
                            {selectedCustomer.address.complement &&
                              ` - ${selectedCustomer.address.complement}`}
                            <br />
                            {selectedCustomer.address.neighborhood} -{" "}
                            {selectedCustomer.address.city}/
                            {selectedCustomer.address.state}
                            <br />
                            CEP: {selectedCustomer.address.zipCode}
                          </p>
                        </div>
                      )}

                      {selectedCustomer.preferences?.observations && (
                        <div className="detail-section">
                          <h3>Observações</h3>
                          <p className="observations-text">
                            {selectedCustomer.preferences.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "loyalty" && (
              <LoyaltySection
                programs={loyaltyPrograms}
                promotions={promotions}
                onCreateProgram={handleCreateLoyaltyProgram}
                onCreatePromotion={handleCreatePromotion}
                onToggleProgram={handleToggleLoyaltyProgram}
                onTogglePromotion={handleTogglePromotion}
                onDeletePromotion={handleDeletePromotion}
              />
            )}

            {activeTab === "communication" && (
              <CommunicationSection
                communications={communications}
                customers={customers}
                onCreateCommunication={handleCreateCommunication}
                onSendCommunication={handleSendCommunication}
                onDeleteCommunication={handleDeleteCommunication}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CRM;
