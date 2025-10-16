import React, { useState, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import type { Employee, EmployeeFormData } from "../../types/rh";
import "./EmployeeForm.css";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    birthDate: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    position: "",
    department: "",
    salary: 0,
    hireDate: "",
    workSchedule: {
      startTime: "08:00",
      endTime: "17:00",
      breakDuration: 60,
      workDays: [1, 2, 3, 4, 5], // Segunda a sexta
    },
    benefits: {
      healthInsurance: false,
      mealVoucher: 0,
      transportationVoucher: 0,
      otherBenefits: [],
    },
    bankAccount: {
      bank: "",
      agency: "",
      account: "",
      accountType: "checking",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otherBenefit, setOtherBenefit] = useState("");

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        cpf: employee.cpf,
        rg: employee.rg || "",
        birthDate: employee.birthDate,
        address: employee.address,
        position: employee.position,
        department: employee.department,
        salary: employee.salary,
        hireDate: employee.hireDate,
        workSchedule: employee.workSchedule,
        benefits: employee.benefits,
        bankAccount: employee.bankAccount,
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Erro ao salvar funcionário");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        if (parent === "address") {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value,
            },
          };
        } else if (parent === "workSchedule") {
          return {
            ...prev,
            workSchedule: {
              ...prev.workSchedule,
              [child]: value,
            },
          };
        } else if (parent === "benefits") {
          return {
            ...prev,
            benefits: {
              ...prev.benefits,
              [child]: value,
            },
          };
        } else if (parent === "bankAccount") {
          return {
            ...prev,
            bankAccount: {
              ...prev.bankAccount,
              [child]: value,
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

  const handleWorkDaysChange = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        workDays: prev.workSchedule.workDays.includes(day)
          ? prev.workSchedule.workDays.filter((d) => d !== day)
          : [...prev.workSchedule.workDays, day],
      },
    }));
  };

  const addOtherBenefit = () => {
    if (otherBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: {
          ...prev.benefits,
          otherBenefits: [...prev.benefits.otherBenefits, otherBenefit.trim()],
        },
      }));
      setOtherBenefit("");
    }
  };

  const removeOtherBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        otherBenefits: prev.benefits.otherBenefits.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const weekDays = [
    { value: 0, label: "Dom" },
    { value: 1, label: "Seg" },
    { value: 2, label: "Ter" },
    { value: 3, label: "Qua" },
    { value: 4, label: "Qui" },
    { value: 5, label: "Sex" },
    { value: 6, label: "Sáb" },
  ];

  return (
    <div className="employee-form-container">
      <h2>{employee ? "Editar Funcionário" : "Novo Funcionário"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-section">
          <h3>Informações Pessoais</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cpf">CPF *</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rg">RG</label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Data de Nascimento *</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Endereço</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="address.zipCode">CEP</label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.street">Rua</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.number">Número</label>
              <input
                type="text"
                id="address.number"
                name="address.number"
                value={formData.address.number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.complement">Complemento</label>
              <input
                type="text"
                id="address.complement"
                name="address.complement"
                value={formData.address.complement}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.neighborhood">Bairro</label>
              <input
                type="text"
                id="address.neighborhood"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.city">Cidade</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.state">Estado</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Informações Profissionais</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="position">Cargo *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Departamento *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salário *</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hireDate">Data de Admissão *</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Horário de Trabalho</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="workSchedule.startTime">Horário de Entrada</label>
              <input
                type="time"
                id="workSchedule.startTime"
                name="workSchedule.startTime"
                value={formData.workSchedule.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workSchedule.endTime">Horário de Saída</label>
              <input
                type="time"
                id="workSchedule.endTime"
                name="workSchedule.endTime"
                value={formData.workSchedule.endTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workSchedule.breakDuration">
                Duração do Intervalo (min)
              </label>
              <input
                type="number"
                id="workSchedule.breakDuration"
                name="workSchedule.breakDuration"
                value={formData.workSchedule.breakDuration}
                onChange={handleChange}
                min="0"
                max="240"
              />
            </div>

            <div className="form-group full-width">
              <label>Dias de Trabalho</label>
              <div className="work-days">
                {weekDays.map((day) => (
                  <label key={day.value} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.workSchedule.workDays.includes(
                        day.value
                      )}
                      onChange={() => handleWorkDaysChange(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Benefícios</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="benefits.healthInsurance"
                  checked={formData.benefits.healthInsurance}
                  onChange={handleChange}
                />
                Plano de Saúde
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="benefits.mealVoucher">Vale Refeição (R$)</label>
              <input
                type="number"
                id="benefits.mealVoucher"
                name="benefits.mealVoucher"
                value={formData.benefits.mealVoucher}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="benefits.transportationVoucher">
                Vale Transporte (R$)
              </label>
              <input
                type="number"
                id="benefits.transportationVoucher"
                name="benefits.transportationVoucher"
                value={formData.benefits.transportationVoucher}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group full-width">
              <label>Outros Benefícios</label>
              <div className="other-benefits">
                <div className="benefit-input">
                  <input
                    type="text"
                    value={otherBenefit}
                    onChange={(e) => setOtherBenefit(e.target.value)}
                    placeholder="Digite um benefício"
                  />
                  <button
                    type="button"
                    onClick={addOtherBenefit}
                    className="btn-add"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
                <div className="benefits-list">
                  {formData.benefits.otherBenefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <span>{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeOtherBenefit(index)}
                        className="btn-remove"
                      >
                        <FiMinus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Dados Bancários</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="bankAccount.bank">Banco</label>
              <input
                type="text"
                id="bankAccount.bank"
                name="bankAccount.bank"
                value={formData.bankAccount.bank}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bankAccount.agency">Agência</label>
              <input
                type="text"
                id="bankAccount.agency"
                name="bankAccount.agency"
                value={formData.bankAccount.agency}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bankAccount.account">Conta</label>
              <input
                type="text"
                id="bankAccount.account"
                name="bankAccount.account"
                value={formData.bankAccount.account}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bankAccount.accountType">Tipo de Conta</label>
              <select
                id="bankAccount.accountType"
                name="bankAccount.accountType"
                value={formData.bankAccount.accountType}
                onChange={handleChange}
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Conta Poupança</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
