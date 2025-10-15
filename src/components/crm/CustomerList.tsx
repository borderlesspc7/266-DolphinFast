import React, { useState } from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Customer } from "../../types/crm";
import "./CustomerList.css";

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onViewDetails: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && customer.active) ||
      (filterActive === "inactive" && !customer.active);

    return matchesSearch && matchesFilter;
  });

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="customer-list-container">
      <div className="list-header">
        <h2>Clientes</h2>
        <div className="list-controls">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-buttons">
            <button
              className={
                filterActive === "all" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterActive("all")}
            >
              Todos
            </button>
            <button
              className={
                filterActive === "active" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterActive("active")}
            >
              Ativos
            </button>
            <button
              className={
                filterActive === "inactive" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterActive("inactive")}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      <div className="customer-stats">
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Total de Clientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {customers.filter((c) => c.active).length}
          </div>
          <div className="stat-label">Clientes Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {customers
              .reduce((sum, c) => sum + c.loyaltyPoints, 0)
              .toLocaleString()}
          </div>
          <div className="stat-label">Total de Pontos</div>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Pontos</th>
                <th>Total Compras</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-name">{customer.name}</div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{formatPhone(customer.phone)}</td>
                  <td>
                    <span className="points-badge">
                      {customer.loyaltyPoints}
                    </span>
                  </td>
                  <td>R$ {customer.totalPurchases.toFixed(2)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        customer.active ? "active" : "inactive"
                      }`}
                    >
                      {customer.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onViewDetails(customer)}
                        className="btn-action btn-view"
                        title="Ver detalhes"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(customer)}
                        className="btn-action btn-edit"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Deseja realmente excluir ${customer.name}?`
                            )
                          ) {
                            onDelete(customer.id);
                          }
                        }}
                        className="btn-action btn-delete"
                        title="Excluir"
                      >
                        <FiTrash2 size={18} />
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
  );
};

export default CustomerList;
