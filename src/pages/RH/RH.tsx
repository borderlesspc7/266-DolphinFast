import React, { useState, useEffect } from "react";
import { FiUsers, FiClock, FiDollarSign } from "react-icons/fi";
import EmployeeForm from "../../components/rh/EmployeeForm";
import EmployeeList from "../../components/rh/EmployeeList";
import TimeRecordSection from "../../components/rh/TimeRecordSection";
import PayrollSection from "../../components/rh/PayrollSection";
import type {
  Employee,
  EmployeeFormData,
  TimeRecord,
  TimeRecordFormData,
  Payroll,
  PayrollCalculation,
} from "../../types/rh";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  createTimeRecord,
  updateTimeRecord,
  deleteTimeRecord,
  getTimeRecords,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getPayrolls,
  markPayrollAsPaid,
} from "../../services/rhService";
import "./RH.css";

const RH: React.FC = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(
    undefined
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch {
      setError("Erro ao carregar funcionários");
    }
  };

  const loadTimeRecords = async (
    employeeId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const data = await getTimeRecords(employeeId, startDate, endDate);
      setTimeRecords(data);
    } catch {
      setError("Erro ao carregar registros de ponto");
    }
  };

  const loadPayrolls = async (
    employeeId?: string,
    month?: number,
    year?: number
  ) => {
    try {
      const data = await getPayrolls(employeeId, month, year);
      setPayrolls(data);
    } catch {
      setError("Erro ao carregar folhas de pagamento");
    }
  };

  // Funcionários
  const handleCreateEmployee = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      await loadEmployees();
      setShowEmployeeForm(false);
    } catch {
      setError("Erro ao criar funcionário");
    }
  };

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;
    try {
      await updateEmployee(editingEmployee.id, data);
      await loadEmployees();
      setShowEmployeeForm(false);
      setEditingEmployee(undefined);
    } catch {
      setError("Erro ao atualizar funcionário");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch {
      setError("Erro ao deletar funcionário");
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleViewEmployeeDetails = (employee: Employee) => {
    // Implementar visualização de detalhes
    console.log("Ver detalhes do funcionário:", employee);
  };

  const handleViewTimeRecords = (employee: Employee) => {
    setActiveTab("timeRecords");
    loadTimeRecords(employee.id);
  };

  const handleViewPayroll = (employee: Employee) => {
    setActiveTab("payroll");
    loadPayrolls(employee.id);
  };

  // Registros de Ponto
  const handleCreateTimeRecord = async (data: TimeRecordFormData) => {
    try {
      await createTimeRecord(data);
      await loadTimeRecords();
    } catch {
      setError("Erro ao criar registro de ponto");
    }
  };

  const handleUpdateTimeRecord = async (
    id: string,
    data: Partial<TimeRecordFormData>
  ) => {
    try {
      await updateTimeRecord(id, data);
      await loadTimeRecords();
    } catch {
      setError("Erro ao atualizar registro de ponto");
    }
  };

  const handleDeleteTimeRecord = async (id: string) => {
    try {
      await deleteTimeRecord(id);
      await loadTimeRecords();
    } catch {
      setError("Erro ao deletar registro de ponto");
    }
  };

  // Folha de Pagamento
  const handleCreatePayroll = async (
    employeeId: string,
    month: number,
    year: number,
    calculation: PayrollCalculation
  ) => {
    try {
      await createPayroll(employeeId, month, year, calculation);
      await loadPayrolls();
    } catch {
      setError("Erro ao criar folha de pagamento");
    }
  };

  const handleUpdatePayroll = async (id: string, data: Partial<Payroll>) => {
    try {
      await updatePayroll(id, data);
      await loadPayrolls();
    } catch {
      setError("Erro ao atualizar folha de pagamento");
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      await deletePayroll(id);
      await loadPayrolls();
    } catch {
      setError("Erro ao deletar folha de pagamento");
    }
  };

  const handleMarkPayrollAsPaid = async (id: string) => {
    try {
      await markPayrollAsPaid(id);
      await loadPayrolls();
    } catch {
      setError("Erro ao marcar folha como paga");
    }
  };

  const tabs = [
    {
      id: "employees",
      label: "Funcionários",
      icon: FiUsers,
      count: employees.length,
    },
    {
      id: "timeRecords",
      label: "Controle de Ponto",
      icon: FiClock,
      count: timeRecords.length,
    },
    {
      id: "payroll",
      label: "Folha de Pagamento",
      icon: FiDollarSign,
      count: payrolls.length,
    },
  ];

  return (
    <div className="rh-page">
      <div className="page-header">
        <h1>Recursos Humanos e Ponto</h1>
        <p>Gerencie funcionários, controle de ponto e folha de pagamento</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-error">
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
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "employees" && (
          <div className="employees-tab">
            {showEmployeeForm ? (
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={
                  editingEmployee ? handleUpdateEmployee : handleCreateEmployee
                }
                onCancel={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(undefined);
                }}
              />
            ) : (
              <EmployeeList
                employees={employees}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                onViewDetails={handleViewEmployeeDetails}
                onViewTimeRecords={handleViewTimeRecords}
                onViewPayroll={handleViewPayroll}
              />
            )}
            {!showEmployeeForm && (
              <div className="tab-actions">
                <button
                  onClick={() => setShowEmployeeForm(true)}
                  className="btn-primary"
                >
                  <FiUsers size={16} />
                  Novo Funcionário
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "timeRecords" && (
          <TimeRecordSection
            employees={employees}
            timeRecords={timeRecords}
            onCreateTimeRecord={handleCreateTimeRecord}
            onUpdateTimeRecord={handleUpdateTimeRecord}
            onDeleteTimeRecord={handleDeleteTimeRecord}
            onLoadTimeRecords={loadTimeRecords}
          />
        )}

        {activeTab === "payroll" && (
          <PayrollSection
            employees={employees}
            payrolls={payrolls}
            onCreatePayroll={handleCreatePayroll}
            onUpdatePayroll={handleUpdatePayroll}
            onDeletePayroll={handleDeletePayroll}
            onLoadPayrolls={loadPayrolls}
            onMarkAsPaid={handleMarkPayrollAsPaid}
          />
        )}
      </div>
    </div>
  );
};

export default RH;
