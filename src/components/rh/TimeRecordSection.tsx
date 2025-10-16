import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Employee, TimeRecord, TimeRecordFormData } from "../../types/rh";
import "./TimeRecordSection.css";

interface TimeRecordSectionProps {
  employees: Employee[];
  timeRecords: TimeRecord[];
  onCreateTimeRecord: (data: TimeRecordFormData) => Promise<void>;
  onUpdateTimeRecord: (
    id: string,
    data: Partial<TimeRecordFormData>
  ) => Promise<void>;
  onDeleteTimeRecord: (id: string) => Promise<void>;
  onLoadTimeRecords: (
    employeeId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
}

const TimeRecordSection: React.FC<TimeRecordSectionProps> = ({
  employees,
  timeRecords,
  onCreateTimeRecord,
  onUpdateTimeRecord,
  onDeleteTimeRecord,
  onLoadTimeRecords,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | undefined>(
    undefined
  );
  const [formData, setFormData] = useState<TimeRecordFormData>({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    clockIn: "",
    clockOut: "",
    breakStart: "",
    breakEnd: "",
    notes: "",
  });

  const [filters, setFilters] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTimeRecords = useCallback(async () => {
    setLoading(true);
    try {
      await onLoadTimeRecords(
        filters.employeeId || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
    } catch {
      setError("Erro ao carregar registros de ponto");
    } finally {
      setLoading(false);
    }
  }, [
    filters.employeeId,
    filters.startDate,
    filters.endDate,
    onLoadTimeRecords,
  ]);

  useEffect(() => {
    loadTimeRecords();
  }, [loadTimeRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingRecord) {
        await onUpdateTimeRecord(editingRecord.id, formData);
      } else {
        await onCreateTimeRecord(formData);
      }
      resetForm();
    } catch {
      setError("Erro ao salvar registro de ponto");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      clockIn: "",
      clockOut: "",
      breakStart: "",
      breakEnd: "",
      notes: "",
    });
    setEditingRecord(undefined);
    setShowForm(false);
  };

  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      date: record.date,
      clockIn: record.clockIn || "",
      clockOut: record.clockOut || "",
      breakStart: record.breakStart || "",
      breakEnd: record.breakEnd || "",
      notes: record.notes || "",
    });
    setShowForm(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    return timeString;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: TimeRecord["status"]) => {
    switch (status) {
      case "present":
        return "present";
      case "absent":
        return "absent";
      case "late":
        return "late";
      case "half_day":
        return "half_day";
      default:
        return "unknown";
    }
  };

  const getStatusLabel = (status: TimeRecord["status"]) => {
    switch (status) {
      case "present":
        return "Presente";
      case "absent":
        return "Faltou";
      case "late":
        return "Atrasado";
      case "half_day":
        return "Meio Período";
      default:
        return "Desconhecido";
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "Funcionário não encontrado";
  };

  const calculateTotalHours = (record: TimeRecord) => {
    return `${record.totalHours.toFixed(1)}h`;
  };

  return (
    <div className="time-record-section">
      <div className="section-header">
        <h2>Controle de Ponto</h2>
        <button className="btn-new" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancelar"
          ) : (
            <>
              <FiPlus size={16} /> Novo Registro
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="time-record-form">
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
              <label>Data *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Entrada</label>
              <input
                type="time"
                name="clockIn"
                value={formData.clockIn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Saída</label>
              <input
                type="time"
                name="clockOut"
                value={formData.clockOut}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Início do Intervalo</label>
              <input
                type="time"
                name="breakStart"
                value={formData.breakStart}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Fim do Intervalo</label>
              <input
                type="time"
                name="breakEnd"
                value={formData.breakEnd}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Observações</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Observações sobre o registro de ponto..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Salvando..." : editingRecord ? "Atualizar" : "Criar"}
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
            <label>Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label>Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              onClick={() =>
                setFilters({ employeeId: "", startDate: "", endDate: "" })
              }
              className="btn-clear-filters"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="time-records-list">
        <h3>Registros de Ponto</h3>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : timeRecords.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum registro de ponto encontrado</p>
          </div>
        ) : (
          <div className="time-records-table-wrapper">
            <table className="time-records-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Data</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                  <th>Intervalo</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {timeRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-name">
                        {getEmployeeName(record.employeeId)}
                      </div>
                    </td>
                    <td>{formatDate(record.date)}</td>
                    <td>{formatTime(record.clockIn)}</td>
                    <td>{formatTime(record.clockOut)}</td>
                    <td>
                      {record.breakStart && record.breakEnd
                        ? `${record.breakStart} - ${record.breakEnd}`
                        : "-"}
                    </td>
                    <td>
                      <span className="total-hours">
                        {calculateTotalHours(record)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(record)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm("Deseja realmente excluir este registro?")
                            ) {
                              onDeleteTimeRecord(record.id);
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

export default TimeRecordSection;
