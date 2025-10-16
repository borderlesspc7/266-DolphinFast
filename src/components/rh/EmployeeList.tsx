import React, { useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import type { Employee } from "../../types/rh";
import "./EmployeeList.css";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onViewDetails: (employee: Employee) => void;
  onViewTimeRecords: (employee: Employee) => void;
  onViewPayroll: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEdit,
  onDelete,
  onViewDetails,
  onViewTimeRecords,
  onViewPayroll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "on_leave"
  >("all");

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || employee.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "active";
      case "inactive":
        return "inactive";
      case "on_leave":
        return "on_leave";
      default:
        return "unknown";
    }
  };

  const getStatusLabel = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "on_leave":
        return "Afastado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="employee-list-container">
      <div className="list-header">
        <h2>Funcionários</h2>
        <div className="list-controls">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, cargo ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-buttons">
            <button
              className={
                filterStatus === "all" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterStatus("all")}
            >
              Todos
            </button>
            <button
              className={
                filterStatus === "active" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterStatus("active")}
            >
              Ativos
            </button>
            <button
              className={
                filterStatus === "inactive" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterStatus("inactive")}
            >
              Inativos
            </button>
            <button
              className={
                filterStatus === "on_leave" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilterStatus("on_leave")}
            >
              Afastados
            </button>
          </div>
        </div>
      </div>

      <div className="employee-stats">
        <div className="stat-card">
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Total de Funcionários</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {employees.filter((e) => e.status === "active").length}
          </div>
          <div className="stat-label">Funcionários Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0))}
          </div>
          <div className="stat-label">Folha Total</div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum funcionário encontrado</p>
        </div>
      ) : (
        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Salário</th>
                <th>Status</th>
                <th>Admissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-name">
                      <div className="name">{employee.name}</div>
                      <div className="email">{employee.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="position">{employee.position}</div>
                  </td>
                  <td>
                    <div className="department">{employee.department}</div>
                  </td>
                  <td>
                    <div className="salary">
                      {formatCurrency(employee.salary)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {getStatusLabel(employee.status)}
                    </span>
                  </td>
                  <td>{formatDate(employee.hireDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onViewDetails(employee)}
                        className="btn-action btn-view"
                        title="Ver detalhes"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => onViewTimeRecords(employee)}
                        className="btn-action btn-time"
                        title="Controle de Ponto"
                      >
                        <FiClock size={18} />
                      </button>
                      <button
                        onClick={() => onViewPayroll(employee)}
                        className="btn-action btn-payroll"
                        title="Folha de Pagamento"
                      >
                        <FiDollarSign size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="btn-action btn-edit"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Deseja realmente excluir ${employee.name}?`
                            )
                          ) {
                            onDelete(employee.id);
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

export default EmployeeList;
