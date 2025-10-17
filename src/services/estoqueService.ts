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
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Product,
  ProductFormData,
  StockMovement,
  StockMovementFormData,
  StockAlert,
  InventoryReport,
} from "../types/estoque";

// Coleções do Firestore
const PRODUCTS_COLLECTION = "products";
const STOCK_MOVEMENTS_COLLECTION = "stockMovements";
const STOCK_ALERTS_COLLECTION = "stockAlerts";

// ==================== PRODUTOS ====================

export const createProduct = async (
  productData: ProductFormData
): Promise<string> => {
  try {
    const newProduct = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, PRODUCTS_COLLECTION),
      newProduct
    );

    // Criar alerta se o estoque inicial estiver baixo
    if (productData.currentStock <= productData.minStock) {
      await createLowStockAlert(docRef.id, productData.currentStock);
    }

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw new Error("Não foi possível criar o produto");
  }
};

export const updateProduct = async (
  id: string,
  productData: Partial<ProductFormData>
): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: new Date().toISOString(),
    });

    // Verificar alertas se o estoque foi atualizado
    if (productData.currentStock !== undefined) {
      const product = await getProduct(id);
      if (product) {
        await checkAndUpdateAlerts(
          id,
          productData.currentStock,
          product.minStock
        );
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error("Não foi possível atualizar o produto");
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw new Error("Não foi possível deletar o produto");
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw new Error("Não foi possível buscar o produto");
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error("Não foi possível buscar os produtos");
  }
};

export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("status", "==", "active"),
      orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Erro ao buscar produtos ativos:", error);
    throw new Error("Não foi possível buscar os produtos ativos");
  }
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter(
      (product) => product.currentStock <= product.minStock
    );
  } catch (error) {
    console.error("Erro ao buscar produtos com estoque baixo:", error);
    throw new Error("Não foi possível buscar os produtos com estoque baixo");
  }
};

// ==================== MOVIMENTAÇÕES DE ESTOQUE ====================

export const createStockMovement = async (
  movementData: StockMovementFormData
): Promise<string> => {
  try {
    // Buscar produto atual
    const product = await getProduct(movementData.productId);
    if (!product) {
      throw new Error("Produto não encontrado");
    }

    const previousStock = product.currentStock;
    let newStock = previousStock;

    // Calcular novo estoque baseado no tipo de movimentação
    switch (movementData.type) {
      case "in":
        newStock = previousStock + movementData.quantity;
        break;
      case "out":
        newStock = previousStock - movementData.quantity;
        break;
      case "adjustment":
        newStock = movementData.quantity;
        break;
      case "loss":
        newStock = previousStock - movementData.quantity;
        break;
      case "transfer":
        newStock = previousStock - movementData.quantity;
        break;
    }

    // Validar estoque negativo
    if (newStock < 0) {
      throw new Error("Estoque não pode ficar negativo");
    }

    const totalValue =
      (movementData.unitPrice || product.costPrice) * movementData.quantity;

    const newMovement = {
      ...movementData,
      previousStock,
      newStock,
      totalValue,
      responsibleUser: "current-user", // TODO: pegar do contexto de autenticação
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, STOCK_MOVEMENTS_COLLECTION),
      newMovement
    );

    // Atualizar estoque do produto
    await updateProduct(movementData.productId, { currentStock: newStock });

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar movimentação de estoque:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Não foi possível criar a movimentação"
    );
  }
};

export const getStockMovements = async (
  productId?: string,
  startDate?: string,
  endDate?: string
): Promise<StockMovement[]> => {
  try {
    let q = query(
      collection(db, STOCK_MOVEMENTS_COLLECTION),
      orderBy("date", "desc")
    );

    if (productId) {
      q = query(q, where("productId", "==", productId));
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
    })) as StockMovement[];
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    throw new Error("Não foi possível buscar as movimentações");
  }
};

export const deleteStockMovement = async (id: string): Promise<void> => {
  try {
    const movementRef = doc(db, STOCK_MOVEMENTS_COLLECTION, id);
    await deleteDoc(movementRef);
  } catch (error) {
    console.error("Erro ao deletar movimentação:", error);
    throw new Error("Não foi possível deletar a movimentação");
  }
};

// ==================== ALERTAS DE ESTOQUE ====================

const createLowStockAlert = async (
  productId: string,
  currentStock: number
): Promise<void> => {
  try {
    const priority = currentStock === 0 ? "critical" : "high";
    const type = currentStock === 0 ? "out_of_stock" : "low_stock";
    const message =
      currentStock === 0 ? "Produto sem estoque" : "Produto com estoque baixo";

    await addDoc(collection(db, STOCK_ALERTS_COLLECTION), {
      productId,
      type,
      message,
      priority,
      status: "active",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao criar alerta:", error);
  }
};

const checkAndUpdateAlerts = async (
  productId: string,
  currentStock: number,
  minStock: number
): Promise<void> => {
  try {
    // Buscar alertas ativos do produto
    const q = query(
      collection(db, STOCK_ALERTS_COLLECTION),
      where("productId", "==", productId),
      where("status", "==", "active")
    );
    const querySnapshot = await getDocs(q);

    if (currentStock <= minStock && querySnapshot.empty) {
      // Criar novo alerta se estoque baixo e não existe alerta ativo
      await createLowStockAlert(productId, currentStock);
    } else if (currentStock > minStock && !querySnapshot.empty) {
      // Resolver alertas se estoque normalizado
      querySnapshot.forEach(async (alertDoc) => {
        await updateDoc(doc(db, STOCK_ALERTS_COLLECTION, alertDoc.id), {
          status: "resolved",
          resolvedAt: new Date().toISOString(),
        });
      });
    }
  } catch (error) {
    console.error("Erro ao verificar alertas:", error);
  }
};

export const getStockAlerts = async (
  status?: "active" | "resolved" | "ignored"
): Promise<StockAlert[]> => {
  try {
    let q = query(
      collection(db, STOCK_ALERTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    if (status) {
      q = query(q, where("status", "==", status));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockAlert[];
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    throw new Error("Não foi possível buscar os alertas");
  }
};

export const updateAlertStatus = async (
  id: string,
  status: "active" | "resolved" | "ignored"
): Promise<void> => {
  try {
    const alertRef = doc(db, STOCK_ALERTS_COLLECTION, id);
    const updateData: Record<string, string> = { status };

    if (status === "resolved") {
      updateData.resolvedAt = new Date().toISOString();
    }

    await updateDoc(alertRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar status do alerta:", error);
    throw new Error("Não foi possível atualizar o status do alerta");
  }
};

// ==================== RELATÓRIOS ====================

export const getInventoryReport = async (): Promise<InventoryReport> => {
  try {
    const products = await getAllProducts();
    const movements = await getStockMovements();

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, product) => sum + product.currentStock * product.costPrice,
      0
    );
    const lowStockItems = products.filter(
      (p) => p.currentStock <= p.minStock && p.currentStock > 0
    ).length;
    const outOfStockItems = products.filter((p) => p.currentStock === 0).length;

    // Calcular produtos mais vendidos (saídas)
    const salesByProduct = new Map<
      string,
      { quantity: number; revenue: number }
    >();
    movements
      .filter((m) => m.type === "out")
      .forEach((movement) => {
        const current = salesByProduct.get(movement.productId) || {
          quantity: 0,
          revenue: 0,
        };
        salesByProduct.set(movement.productId, {
          quantity: current.quantity + movement.quantity,
          revenue: current.revenue + movement.totalValue,
        });
      });

    const topSellingProducts = Array.from(salesByProduct.entries())
      .map(([productId, stats]) => {
        const product = products.find((p) => p.id === productId);
        return {
          productId,
          productName: product?.name || "Produto não encontrado",
          quantitySold: stats.quantity,
          totalRevenue: stats.revenue,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Estoque por categoria
    const stockByCategory = Array.from(
      products.reduce((map, product) => {
        const current = map.get(product.category) || { quantity: 0, value: 0 };
        map.set(product.category, {
          quantity: current.quantity + product.currentStock,
          value: current.value + product.currentStock * product.costPrice,
        });
        return map;
      }, new Map<string, { quantity: number; value: number }>())
    ).map(([category, stats]) => ({
      category,
      quantity: stats.quantity,
      value: stats.value,
    }));

    const recentMovements = movements.slice(0, 10);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      topSellingProducts,
      recentMovements,
      stockByCategory,
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw new Error("Não foi possível gerar o relatório");
  }
};
