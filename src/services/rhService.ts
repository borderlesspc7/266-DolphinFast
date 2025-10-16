import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Employee,
  EmployeeFormData,
  TimeRecord,
  TimeRecordFormData,
  Payroll,
  PayrollCalculation,
} from "../types/rh";

// Coleções do Firestore
const EMPLOYEES_COLLECTION = "employees";
const TIME_RECORDS_COLLECTION = "timeRecords";
const PAYROLLS_COLLECTION = "payrolls";

// ==================== FUNCIONÁRIOS ====================

export const createEmployee = async (
  employeeData: EmployeeFormData
): Promise<string> => {
  try {
    const newEmployee = {
      ...employeeData,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, EMPLOYEES_COLLECTION),
      newEmployee
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    throw new Error("Não foi possível criar o funcionário");
  }
};

export const updateEmployee = async (
  id: string,
  employeeData: Partial<EmployeeFormData>
): Promise<void> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    await updateDoc(employeeRef, {
      ...employeeData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    throw new Error("Não foi possível atualizar o funcionário");
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    await deleteDoc(employeeRef);
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    throw new Error("Não foi possível deletar o funcionário");
  }
};

export const getEmployee = async (id: string): Promise<Employee | null> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    const employeeDoc = await getDoc(employeeRef);

    if (employeeDoc.exists()) {
      return { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    throw new Error("Não foi possível buscar o funcionário");
  }
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, EMPLOYEES_COLLECTION), orderBy("createdAt", "desc"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    throw new Error("Não foi possível buscar os funcionários");
  }
};

export const getActiveEmployees = async (): Promise<Employee[]> => {
  try {
    const q = query(
      collection(db, EMPLOYEES_COLLECTION),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];
  } catch (error) {
    console.error("Erro ao buscar funcionários ativos:", error);
    throw new Error("Não foi possível buscar os funcionários ativos");
  }
};

export const updateEmployeeStatus = async (
  id: string,
  status: Employee["status"]
): Promise<void> => {
  try {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, id);
    await updateDoc(employeeRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar status do funcionário:", error);
    throw new Error("Não foi possível atualizar o status do funcionário");
  }
};

// ==================== CONTROLE DE PONTO ====================

export const createTimeRecord = async (
  timeRecordData: TimeRecordFormData
): Promise<string> => {
  try {
    // Calcular horas trabalhadas
    const totalHours = calculateTotalHours(timeRecordData);
    const overtimeHours = Math.max(0, totalHours - 8); // 8 horas padrão

    const newTimeRecord = {
      ...timeRecordData,
      totalHours,
      overtimeHours,
      status: determineTimeRecordStatus(timeRecordData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, TIME_RECORDS_COLLECTION),
      newTimeRecord
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar registro de ponto:", error);
    throw new Error("Não foi possível criar o registro de ponto");
  }
};

export const updateTimeRecord = async (
  id: string,
  timeRecordData: Partial<TimeRecordFormData>
): Promise<void> => {
  try {
    const timeRecordRef = doc(db, TIME_RECORDS_COLLECTION, id);

    // Recalcular horas se necessário
    const updatedData = { ...timeRecordData };
    if (timeRecordData.clockIn || timeRecordData.clockOut) {
      const totalHours = calculateTotalHours(
        timeRecordData as TimeRecordFormData
      );
      const overtimeHours = Math.max(0, totalHours - 8);
      Object.assign(updatedData, { totalHours, overtimeHours });
    }

    await updateDoc(timeRecordRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar registro de ponto:", error);
    throw new Error("Não foi possível atualizar o registro de ponto");
  }
};

export const deleteTimeRecord = async (id: string): Promise<void> => {
  try {
    const timeRecordRef = doc(db, TIME_RECORDS_COLLECTION, id);
    await deleteDoc(timeRecordRef);
  } catch (error) {
    console.error("Erro ao deletar registro de ponto:", error);
    throw new Error("Não foi possível deletar o registro de ponto");
  }
};

export const getTimeRecords = async (
  employeeId?: string,
  startDate?: string,
  endDate?: string
): Promise<TimeRecord[]> => {
  try {
    let q = query(
      collection(db, TIME_RECORDS_COLLECTION),
      orderBy("date", "desc")
    );

    if (employeeId) {
      q = query(q, where("employeeId", "==", employeeId));
    }

    if (startDate) {
      q = query(q, where("date", ">=", startDate));
    }

    if (endDate) {
      q = query(q, where("date", "<=", endDate));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TimeRecord[];
  } catch (error) {
    console.error("Erro ao buscar registros de ponto:", error);
    throw new Error("Não foi possível buscar os registros de ponto");
  }
};

export const getTimeRecordsByEmployee = async (
  employeeId: string,
  month?: number,
  year?: number
): Promise<TimeRecord[]> => {
  try {
    let q = query(
      collection(db, TIME_RECORDS_COLLECTION),
      where("employeeId", "==", employeeId),
      orderBy("date", "desc")
    );

    if (month && year) {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;
      q = query(
        q,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TimeRecord[];
  } catch (error) {
    console.error("Erro ao buscar registros de ponto do funcionário:", error);
    throw new Error(
      "Não foi possível buscar os registros de ponto do funcionário"
    );
  }
};

// ==================== FOLHA DE PAGAMENTO ====================

export const createPayroll = async (
  employeeId: string,
  month: number,
  year: number,
  calculation: PayrollCalculation
): Promise<string> => {
  try {
    const overtimePay =
      calculation.overtimeHours *
      (calculation.baseSalary / 220) *
      calculation.overtimeRate;
    const grossSalary =
      calculation.baseSalary +
      overtimePay +
      Object.values(calculation.benefits).reduce(
        (sum, value) => sum + value,
        0
      );

    const totalDeductions = Object.values(calculation.deductions).reduce(
      (sum, value) => sum + value,
      0
    );
    const netSalary = grossSalary - totalDeductions;

    const newPayroll = {
      employeeId,
      month,
      year,
      baseSalary: calculation.baseSalary,
      overtimePay: overtimePay,
      benefits: calculation.benefits,
      deductions: calculation.deductions,
      grossSalary,
      netSalary,
      status: "calculated",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, PAYROLLS_COLLECTION),
      newPayroll
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar folha de pagamento:", error);
    throw new Error("Não foi possível criar a folha de pagamento");
  }
};

export const updatePayroll = async (
  id: string,
  payrollData: Partial<Payroll>
): Promise<void> => {
  try {
    const payrollRef = doc(db, PAYROLLS_COLLECTION, id);
    await updateDoc(payrollRef, {
      ...payrollData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar folha de pagamento:", error);
    throw new Error("Não foi possível atualizar a folha de pagamento");
  }
};

export const getPayrolls = async (
  employeeId?: string,
  month?: number,
  year?: number
): Promise<Payroll[]> => {
  try {
    let q = query(
      collection(db, PAYROLLS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    if (employeeId) {
      q = query(q, where("employeeId", "==", employeeId));
    }

    if (month) {
      q = query(q, where("month", "==", month));
    }

    if (year) {
      q = query(q, where("year", "==", year));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Payroll[];
  } catch (error) {
    console.error("Erro ao buscar folhas de pagamento:", error);
    throw new Error("Não foi possível buscar as folhas de pagamento");
  }
};

export const markPayrollAsPaid = async (id: string): Promise<void> => {
  try {
    const payrollRef = doc(db, PAYROLLS_COLLECTION, id);
    await updateDoc(payrollRef, {
      status: "paid",
      paymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao marcar folha como paga:", error);
    throw new Error("Não foi possível marcar a folha como paga");
  }
};

export const deletePayroll = async (id: string): Promise<void> => {
  try {
    const payrollRef = doc(db, PAYROLLS_COLLECTION, id);
    await deleteDoc(payrollRef);
  } catch (error) {
    console.error("Erro ao deletar folha de pagamento:", error);
    throw new Error("Não foi possível deletar a folha de pagamento");
  }
};

// ==================== FUNÇÕES AUXILIARES ====================

const calculateTotalHours = (timeRecord: TimeRecordFormData): number => {
  if (!timeRecord.clockIn || !timeRecord.clockOut) return 0;

  const clockIn = new Date(`2000-01-01T${timeRecord.clockIn}`);
  const clockOut = new Date(`2000-01-01T${timeRecord.clockOut}`);

  let totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);

  // Subtrair intervalo se existir
  if (timeRecord.breakStart && timeRecord.breakEnd) {
    const breakStart = new Date(`2000-01-01T${timeRecord.breakStart}`);
    const breakEnd = new Date(`2000-01-01T${timeRecord.breakEnd}`);
    const breakMinutes =
      (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
    totalMinutes -= breakMinutes;
  }

  return Math.max(0, totalMinutes / 60);
};

const determineTimeRecordStatus = (
  timeRecord: TimeRecordFormData
): TimeRecord["status"] => {
  if (!timeRecord.clockIn) return "absent";

  const clockIn = new Date(`2000-01-01T${timeRecord.clockIn}`);
  const expectedStart = new Date(`2000-01-01T08:00`); // 8:00 AM padrão

  if (clockIn > expectedStart) return "late";

  if (!timeRecord.clockOut) return "present";

  const totalHours = calculateTotalHours(timeRecord);
  if (totalHours < 4) return "half_day";

  return "present";
};
