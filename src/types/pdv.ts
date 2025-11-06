export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  duration?: number; // em minutos
  description?: string;
}

export interface CartItem {
  id: string;
  type: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

export interface Payment {
  method: PaymentMethod;
  amount: number;
  installments?: number; // Para crédito
}

export interface Sale {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  total: number;
  payment: Payment;
  customerId?: string;
  customerName?: string;
  employeeId: string;
  employeeName: string;
  status: "completed" | "cancelled";
}

export interface CashRegister {
  id: string;
  date: Date;
  openingAmount: number;
  closingAmount?: number;
  totalSales: number;
  totalPayments: {
    pix: number;
    debito: number;
    credito: number;
    dinheiro: number;
  };
  sales: Sale[];
  status: "open" | "closed";
  employeeId: string;
  employeeName: string;
}

export interface DailyReport {
  date: string;
  totalSales: number;
  totalTransactions: number;
  paymentMethods: {
    pix: number;
    debito: number;
    credito: number;
    dinheiro: number;
  };
  sales: Sale[];
}

