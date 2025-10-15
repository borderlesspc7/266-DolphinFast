import React, { useState } from "react";
import {
  FiMail,
  FiMessageSquare,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";
import type { Communication, Customer } from "../../types/crm";
import "./CommunicationSection.css";

interface CommunicationSectionProps {
  communications: Communication[];
  customers: Customer[];
  onCreateCommunication: (
    communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onSendCommunication: (id: string) => Promise<void>;
  onDeleteCommunication: (id: string) => Promise<void>;
}

const CommunicationSection: React.FC<CommunicationSectionProps> = ({
  communications,
  customers,
  onCreateCommunication,
  onSendCommunication,
  onDeleteCommunication,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "email" as "email" | "sms" | "whatsapp",
    targetCustomers: [] as string[],
    status: "draft" as "draft" | "scheduled" | "sent" | "failed",
    scheduledFor: "",
  });

  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetCustomers = selectAllCustomers
      ? customers.filter((c) => c.active).map((c) => c.id)
      : formData.targetCustomers;

    await onCreateCommunication({
      ...formData,
      targetCustomers,
    });

    setFormData({
      title: "",
      message: "",
      type: "email",
      targetCustomers: [],
      status: "draft",
      scheduledFor: "",
    });
    setSelectAllCustomers(false);
    setShowForm(false);
  };

  const handleCustomerToggle = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCustomers: prev.targetCustomers.includes(customerId)
        ? prev.targetCustomers.filter((id) => id !== customerId)
        : [...prev.targetCustomers, customerId],
    }));
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getStatusColor = (status: Communication["status"]) => {
    switch (status) {
      case "draft":
        return "draft";
      case "scheduled":
        return "scheduled";
      case "sent":
        return "sent";
      case "failed":
        return "failed";
      default:
        return "draft";
    }
  };

  const getStatusLabel = (status: Communication["status"]) => {
    switch (status) {
      case "draft":
        return "Rascunho";
      case "scheduled":
        return "Agendado";
      case "sent":
        return "Enviado";
      case "failed":
        return "Falhou";
      default:
        return "Desconhecido";
    }
  };

  const getTypeIcon = (type: Communication["type"]) => {
    switch (type) {
      case "email":
        return <FiMail />;
      case "sms":
        return <FiMessageSquare />;
      case "whatsapp":
        return <FiSmartphone />;
      default:
        return <FiMail />;
    }
  };

  const getTypeLabel = (type: Communication["type"]) => {
    switch (type) {
      case "email":
        return "E-mail";
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="communication-section">
      <div className="section-header">
        <h2>Comunicação</h2>
        <button className="btn-new" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Nova Campanha"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="communication-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Título da Campanha</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Canal de Comunicação</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "email" | "sms" | "whatsapp",
                  })
                }
              >
                <option value="email">E-mail</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Mensagem</label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                required
                placeholder="Digite a mensagem que será enviada aos clientes..."
              />
              <small className="char-count">
                {formData.message.length} caracteres
              </small>
            </div>

            <div className="form-group">
              <label>Agendar Envio (Opcional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledFor: e.target.value })
                }
              />
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectAllCustomers}
                  onChange={(e) => setSelectAllCustomers(e.target.checked)}
                />
                Enviar para todos os clientes ativos (
                {customers.filter((c) => c.active).length})
              </label>
            </div>

            {!selectAllCustomers && (
              <div className="form-group full-width">
                <label>Selecionar Clientes</label>
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="customer-selection">
                  {filteredCustomers.map((customer) => (
                    <label key={customer.id} className="customer-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.targetCustomers.includes(customer.id)}
                        onChange={() => handleCustomerToggle(customer.id)}
                      />
                      <div className="customer-info">
                        <span className="customer-name">{customer.name}</span>
                        <span className="customer-contact">
                          {formData.type === "email" && customer.email}
                          {formData.type === "sms" && customer.phone}
                          {formData.type === "whatsapp" &&
                            (customer.whatsapp || customer.phone)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <small className="selection-count">
                  {formData.targetCustomers.length} clientes selecionados
                </small>
              </div>
            )}
          </div>

          <button type="submit" className="btn-submit">
            {formData.scheduledFor ? "Agendar Campanha" : "Criar Campanha"}
          </button>
        </form>
      )}

      <div className="communications-list">
        <h3>Campanhas</h3>
        {communications.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma campanha criada</p>
          </div>
        ) : (
          <div className="communications-grid">
            {communications.map((communication) => (
              <div key={communication.id} className="communication-card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="type-icon">
                      {getTypeIcon(communication.type)}
                    </span>
                    <h4>{communication.title}</h4>
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(
                      communication.status
                    )}`}
                  >
                    {getStatusLabel(communication.status)}
                  </span>
                </div>

                <p className="card-message">{communication.message}</p>

                <div className="card-info">
                  <div className="info-row">
                    <span className="info-label">Canal:</span>
                    <span className="info-value">
                      {getTypeLabel(communication.type)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Destinatários:</span>
                    <span className="info-value">
                      {communication.targetCustomers.length}
                    </span>
                  </div>
                  {communication.scheduledFor && (
                    <div className="info-row">
                      <span className="info-label">Agendado para:</span>
                      <span className="info-value">
                        {formatDate(communication.scheduledFor)}
                      </span>
                    </div>
                  )}
                  {communication.sentAt && (
                    <div className="info-row">
                      <span className="info-label">Enviado em:</span>
                      <span className="info-value">
                        {formatDate(communication.sentAt)}
                      </span>
                    </div>
                  )}
                </div>

                {communication.stats && (
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Enviados</span>
                      <span className="stat-value">
                        {communication.stats.sent}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Entregues</span>
                      <span className="stat-value">
                        {communication.stats.delivered}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Abertos</span>
                      <span className="stat-value">
                        {communication.stats.opened}
                      </span>
                    </div>
                  </div>
                )}

                <div className="card-actions">
                  {communication.status === "draft" && (
                    <button
                      onClick={() => onSendCommunication(communication.id)}
                      className="btn-send"
                    >
                      Enviar Agora
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente excluir esta campanha?")) {
                        onDeleteCommunication(communication.id);
                      }
                    }}
                    className="btn-delete"
                  >
                    <FiTrash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationSection;
