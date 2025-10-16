import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import type { Employee, Payroll, PayrollCalculation } from "../../types/rh";
import "./PayrollSection.css";

interface PayrollSectionProps {
  employees: Employee[];
  payrolls: Payroll[];
  onCreatePayroll: (
    employeeId: string,
    month: number,
    year: number,
    calculation: PayrollCalculation
  ) => Promise<void>;
  onUpdatePayroll: (id: string, data: Partial<Payroll>) => Promise<void>;
  onDeletePayroll: (id: string) => Promise<void>;
  onLoadPayrolls: (
    employeeId?: string,
    month?: number,
    year?: number
  ) => Promise<void>;
  onMarkAsPaid: (id: string) => Promise<void>;
}

const PayrollSection: React.FC<PayrollSectionProps> = ({
  employees,
  payrolls,
  onCreatePayroll,
  onUpdatePayroll,
  onDeletePayroll,
  onLoadPayrolls,
  onMarkAsPaid,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | undefined>(
    undefined
  );
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    calculation: {
      baseSalary: 0,
      overtimeHours: 0,
      overtimeRate: 1.5,
      benefits: {
        healthInsurance: 0,
        mealVoucher: 0,
        transportationVoucher: 0,
        otherBenefits: 0,
      },
      deductions: {
        inss: 0,
        irrf: 0,
        fgts: 0,
        otherDeductions: 0,
      },
    },
  });

  const [filters, setFilters] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      await onLoadPayrolls(
        filters.employeeId || undefined,
        filters.month || undefined,
        filters.year || undefined
      );
    } catch {
      setError("Erro ao carregar folhas de pagamento");
    } finally {
      setLoading(false);
    }
  }, [filters.employeeId, filters.month, filters.year, onLoadPayrolls]);

  useEffect(() => {
    loadPayrolls();
  }, [loadPayrolls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingPayroll) {
        await onUpdatePayroll(editingPayroll.id, formData);
      } else {
        await onCreatePayroll(
          formData.employeeId,
          formData.month,
          formData.year,
          formData.calculation
        );
      }
      resetForm();
    } catch {
      setError("Erro ao salvar folha de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      calculation: {
        baseSalary: 0,
        overtimeHours: 0,
        overtimeRate: 1.5,
        benefits: {
          healthInsurance: 0,
          mealVoucher: 0,
          transportationVoucher: 0,
          otherBenefits: 0,
        },
        deductions: {
          inss: 0,
          irrf: 0,
          fgts: 0,
          otherDeductions: 0,
        },
      },
    });
    setEditingPayroll(undefined);
    setShowForm(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        if (parent === "calculation") {
          return {
            ...prev,
            calculation: {
              ...prev.calculation,
              [child]: type === "number" ? parseFloat(value) || 0 : value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const calculateGrossSalary = () => {
    const { baseSalary, overtimeHours, overtimeRate, benefits } =
      formData.calculation;
    const overtimePay = overtimeHours * (baseSalary / 220) * overtimeRate; // 220 horas mensais
    const totalBenefits = Object.values(benefits).reduce(
      (sum, value) => sum + value,
      0
    );
    return baseSalary + overtimePay + totalBenefits;
  };

  const calculateNetSalary = () => {
    const grossSalary = calculateGrossSalary();
    const totalDeductions = Object.values(
      formData.calculation.deductions
    ).reduce((sum, value) => sum + value, 0);
    return grossSalary - totalDeductions;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "Funcionário não encontrado";
  };

  const getStatusColor = (status: Payroll["status"]) => {
    switch (status) {
      case "draft":
        return "draft";
      case "calculated":
        return "calculated";
      case "paid":
        return "paid";
      default:
        return "unknown";
    }
  };

  const getStatusLabel = (status: Payroll["status"]) => {
    switch (status) {
      case "draft":
        return "Rascunho";
      case "calculated":
        return "Calculado";
      case "paid":
        return "Pago";
      default:
        return "Desconhecido";
    }
  };

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  return (
    <div className="payroll-section">
      <div className="section-header">
        <h2>Folha de Pagamento</h2>
        <button className="btn-new" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancelar"
          ) : (
            <>
              <FiPlus size={16} /> Nova Folha
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="payroll-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Funcionário *</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um funcionário</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mês *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ano *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2020"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label>Salário Base (R$) *</label>
              <input
                type="number"
                name="calculation.baseSalary"
                value={formData.calculation.baseSalary}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Horas Extras</label>
              <input
                type="number"
                name="calculation.overtimeHours"
                value={formData.calculation.overtimeHours}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Taxa Hora Extra</label>
              <input
                type="number"
                name="calculation.overtimeRate"
                value={formData.calculation.overtimeRate}
                onChange={handleChange}
                step="0.1"
                min="1"
              />
            </div>
          </div>

          <div className="calculation-section">
            <h3>Cálculo da Folha</h3>
            <div className="calculation-grid">
              <div className="calculation-item">
                <span>Salário Base:</span>
                <span>{formatCurrency(formData.calculation.baseSalary)}</span>
              </div>
              <div className="calculation-item">
                <span>Horas Extras:</span>
                <span>
                  {formatCurrency(
                    formData.calculation.overtimeHours *
                      (formData.calculation.baseSalary / 220) *
                      formData.calculation.overtimeRate
                  )}
                </span>
              </div>
              <div className="calculation-item">
                <span>Benefícios:</span>
                <span>
                  {formatCurrency(
                    Object.values(formData.calculation.benefits).reduce(
                      (sum, value) => sum + value,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="calculation-item total">
                <span>Salário Bruto:</span>
                <span>{formatCurrency(calculateGrossSalary())}</span>
              </div>
              <div className="calculation-item">
                <span>Descontos:</span>
                <span>
                  {formatCurrency(
                    Object.values(formData.calculation.deductions).reduce(
                      (sum, value) => sum + value,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="calculation-item final">
                <span>Salário Líquido:</span>
                <span>{formatCurrency(calculateNetSalary())}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Salvando..." : editingPayroll ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      )}

      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Funcionário</label>
            <select
              value={filters.employeeId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, employeeId: e.target.value }))
              }
            >
              <option value="">Todos os funcionários</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mês</label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  month: parseInt(e.target.value),
                }))
              }
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ano</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  year: parseInt(e.target.value),
                }))
              }
              min="2020"
              max="2030"
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  employeeId: "",
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear(),
                })
              }
              className="btn-clear-filters"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payrolls-list">
        <h3>Folhas de Pagamento</h3>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma folha de pagamento encontrada</p>
          </div>
        ) : (
          <div className="payrolls-table-wrapper">
            <table className="payrolls-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Período</th>
                  <th>Salário Bruto</th>
                  <th>Descontos</th>
                  <th>Salário Líquido</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td>
                      <div className="employee-name">
                        {getEmployeeName(payroll.employeeId)}
                      </div>
                    </td>
                    <td>
                      <div className="period">
                        {months.find((m) => m.value === payroll.month)?.label}{" "}
                        {payroll.year}
                      </div>
                    </td>
                    <td>
                      <div className="gross-salary">
                        {formatCurrency(payroll.grossSalary)}
                      </div>
                    </td>
                    <td>
                      <div className="deductions">
                        {formatCurrency(
                          Object.values(payroll.deductions).reduce(
                            (sum, value) => sum + value,
                            0
                          )
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="net-salary">
                        {formatCurrency(payroll.netSalary)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(
                          payroll.status
                        )}`}
                      >
                        {getStatusLabel(payroll.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {payroll.status === "calculated" && (
                          <button
                            onClick={() => onMarkAsPaid(payroll.id)}
                            className="btn-action btn-paid"
                            title="Marcar como Pago"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (
                              confirm("Deseja realmente excluir esta folha?")
                            ) {
                              onDeletePayroll(payroll.id);
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

export default PayrollSection;
