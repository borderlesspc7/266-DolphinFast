// Tipos para o sistema de Estoque

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: "unit" | "kg" | "l" | "m" | "box" | "pack";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  supplier: string;
  supplierContact?: string;
  location?: string;
  status: "active" | "inactive" | "discontinued";
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: "unit" | "kg" | "l" | "m" | "box" | "pack";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  supplier: string;
  supplierContact?: string;
  location?: string;
  status: "active" | "inactive" | "discontinued";
  image?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment" | "loss" | "transfer";
  quantity: number;
  previousStock: number;
  newStock: number;
  unitPrice?: number;
  totalValue: number;
  reason: string;
  reference?: string;
  responsibleUser: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface StockMovementFormData {
  productId: string;
  type: "in" | "out" | "adjustment" | "loss" | "transfer";
  quantity: number;
  unitPrice?: number;
  reason: string;
  reference?: string;
  notes?: string;
  date: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  type: "low_stock" | "out_of_stock" | "overstock" | "expiring";
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "ignored";
  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }>;
  recentMovements: StockMovement[];
  stockByCategory: Array<{
    category: string;
    quantity: number;
    value: number;
  }>;
}
