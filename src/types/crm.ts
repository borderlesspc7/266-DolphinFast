// Tipos para CRM

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  cpf?: string;
  birthDate?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    favoriteProducts?: string[];
    dietaryRestrictions?: string[];
    observations?: string;
  };
  loyaltyPoints: number;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerReal: number; // Pontos ganhos por real gasto
  active: boolean;
  rules: {
    minPurchaseValue?: number;
    validUntil?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "points";
  discountValue: number;
  pointsCost?: number; // Pontos necessários para resgatar
  validFrom: string;
  validUntil: string;
  targetCustomers?: string[]; // IDs dos clientes alvo (vazio = todos)
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  title: string;
  message: string;
  type: "email" | "sms" | "whatsapp";
  targetCustomers: string[]; // IDs dos clientes alvo
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  cpf?: string;
  birthDate?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    favoriteProducts?: string[];
    dietaryRestrictions?: string[];
    observations?: string;
  };
}
