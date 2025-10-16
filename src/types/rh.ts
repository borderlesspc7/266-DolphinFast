// Tipos para Recursos Humanos

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive" | "on_leave";
  workSchedule: {
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    breakDuration: number; // minutos
    workDays: number[]; // 0-6 (domingo-sábado)
  };
  benefits: {
    healthInsurance: boolean;
    mealVoucher: number;
    transportationVoucher: number;
    otherBenefits: string[];
  };
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    accountType: "checking" | "savings";
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // HH:MM
  clockOut?: string; // HH:MM
  breakStart?: string; // HH:MM
  breakEnd?: string; // HH:MM
  totalHours: number; // horas trabalhadas
  overtimeHours: number; // horas extras
  status: "present" | "absent" | "late" | "half_day";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: number; // 1-12
  year: number;
  baseSalary: number;
  overtimePay: number;
  benefits: {
    healthInsurance: number;
    mealVoucher: number;
    transportationVoucher: number;
    otherBenefits: number;
  };
  deductions: {
    inss: number;
    irrf: number; // Imposto de Renda
    fgts: number;
    otherDeductions: number;
  };
  grossSalary: number;
  netSalary: number;
  status: "draft" | "calculated" | "paid";
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  workSchedule: {
    startTime: string;
    endTime: string;
    breakDuration: number;
    workDays: number[];
  };
  benefits: {
    healthInsurance: boolean;
    mealVoucher: number;
    transportationVoucher: number;
    otherBenefits: string[];
  };
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    accountType: "checking" | "savings";
  };
}

export interface TimeRecordFormData {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

export interface PayrollCalculation {
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number; // 1.5x, 2x, etc.
  benefits: {
    healthInsurance: number;
    mealVoucher: number;
    transportationVoucher: number;
    otherBenefits: number;
  };
  deductions: {
    inss: number;
    irrf: number;
    fgts: number;
    otherDeductions: number;
  };
}
