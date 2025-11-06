// Tipos de usuários
export type UserRole = "admin" | "gerente" | "caixa" | "lavador" | "user";

// Cliente: user
// Funcionários: admin, gerente, caixa, lavador
export type EmployeeRole = "admin" | "gerente" | "caixa" | "lavador";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phone?: string;
  role?: UserRole;
}

// Utilitários para verificar tipos de usuários
export const isEmployee = (role?: UserRole): role is EmployeeRole => {
  return role === "admin" || role === "gerente" || role === "caixa" || role === "lavador";
};

export const isClient = (role?: UserRole): boolean => {
  return role === "user";
};

export const getRoleLabel = (role?: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: "Administrador",
    gerente: "Gerente",
    caixa: "Caixa",
    lavador: "Lavador",
    user: "Cliente",
  };
  return labels[role || "user"];
};
