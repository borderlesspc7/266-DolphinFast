import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Service,
  Sale,
  CashRegister,
  DailyReport,
} from "../types/pdv";
import { createStockMovement } from "./estoqueService";
import { getProduct } from "./estoqueService";

// Coleções do Firestore
const SERVICES_COLLECTION = "services";
const SALES_COLLECTION = "sales";
const CASH_REGISTERS_COLLECTION = "cashRegisters";

// ==================== SERVIÇOS ====================

export const createService = async (
  serviceData: Omit<Service, "id">
): Promise<string> => {
  try {
    const newService = {
      ...serviceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, SERVICES_COLLECTION),
      newService
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    throw new Error("Não foi possível criar o serviço");
  }
};

export const updateService = async (
  id: string,
  serviceData: Partial<Omit<Service, "id">>
): Promise<void> => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(serviceRef, {
      ...serviceData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    throw new Error("Não foi possível atualizar o serviço");
  }
};

export const getAllServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, SERVICES_COLLECTION), orderBy("name", "asc"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw new Error("Não foi possível buscar os serviços");
  }
};

export const getService = async (id: string): Promise<Service | null> => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    const serviceDoc = await getDoc(serviceRef);

    if (serviceDoc.exists()) {
      return { id: serviceDoc.id, ...serviceDoc.data() } as Service;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    throw new Error("Não foi possível buscar o serviço");
  }
};

// ==================== VENDAS ====================

export const createSale = async (
  saleData: Omit<Sale, "id">,
  userId: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("ID do usuário é obrigatório para criar venda");
    }

    // Converter Date para Timestamp do Firestore
    const sale = {
      ...saleData,
      date: Timestamp.fromDate(saleData.date),
      createdAt: new Date().toISOString(),
      // Garantir que customerId seja incluído se customerName estiver presente
      customerId: saleData.customerId || undefined,
      customerName: saleData.customerName || undefined,
    };

    const docRef = await addDoc(collection(db, SALES_COLLECTION), sale);

    // Atualizar estoque para produtos vendidos
    for (const item of saleData.items) {
      if (item.type === "product") {
        // Remover prefixo "estoque_" se existir
        const productId = item.id.startsWith("estoque_")
          ? item.id.replace("estoque_", "")
          : item.id;

        try {
          const product = await getProduct(productId);
          if (product) {
            // Criar movimentação de saída (venda)
            await createStockMovement(
              {
                productId,
                type: "out",
                quantity: item.quantity,
                unitPrice: item.price,
                date: new Date().toISOString(),
                reason: "Venda realizada no PDV",
                notes: `Venda #${docRef.id}`,
              },
              userId
            );
          }
        } catch (error) {
          console.error(
            `Erro ao atualizar estoque do produto ${productId}:`,
            error
          );
          // Continuar com outros produtos mesmo se um falhar
        }
      }
    }

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    throw new Error("Não foi possível criar a venda");
  }
};

export const getSales = async (
  startDate?: Date,
  endDate?: Date,
  employeeId?: string
): Promise<Sale[]> => {
  try {
    // Construir query sem múltiplos where + orderBy para evitar necessidade de índice
    let q;
    
    if (employeeId) {
      // Se temos employeeId, usar apenas esse filtro com orderBy (não precisa de índice composto)
      q = query(
        collection(db, SALES_COLLECTION),
        where("employeeId", "==", employeeId),
        orderBy("date", "desc")
      );
    } else {
      // Sem employeeId, usar apenas orderBy
      q = query(
        collection(db, SALES_COLLECTION),
        orderBy("date", "desc")
      );
    }

    const querySnapshot = await getDocs(q);

    // Filtrar por data em memória se necessário
    let sales = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(), // Converter Timestamp para Date
      } as Sale;
    });

    // Aplicar filtros de data em memória
    if (startDate) {
      sales = sales.filter((sale) => sale.date >= startDate);
    }
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      sales = sales.filter((sale) => sale.date <= endDateWithTime);
    }

    return sales;
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    throw new Error("Não foi possível buscar as vendas");
  }
};

export const getSale = async (id: string): Promise<Sale | null> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, id);
    const saleDoc = await getDoc(saleRef);

    if (saleDoc.exists()) {
      const data = saleDoc.data();
      return {
        id: saleDoc.id,
        ...data,
        date: data.date.toDate(),
      } as Sale;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    throw new Error("Não foi possível buscar a venda");
  }
};

// ==================== HISTÓRICO DO CLIENTE ====================

export const getCustomerPurchases = async (
  customerId: string
): Promise<Array<{
  id: string;
  date: string;
  service: string;
  amount: number;
  status: string;
}>> => {
  try {
    // Usar apenas customerId e orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, SALES_COLLECTION),
      where("customerId", "==", customerId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const sale = {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
        } as Sale;

        // Filtrar apenas vendas concluídas
        if (sale.status !== "completed") {
          return null;
        }

        // Pegar o primeiro item do tipo serviço ou o primeiro item
        const serviceItem = sale.items.find((item) => item.type === "service") || sale.items[0];
        const serviceName = serviceItem?.name || "Serviço";

        return {
          id: sale.id,
          date: sale.date.toISOString(),
          service: serviceName,
          amount: sale.total,
          status: "Concluído",
        };
      })
      .filter((purchase): purchase is NonNullable<typeof purchase> => purchase !== null);
  } catch (error) {
    console.error("Erro ao buscar compras do cliente:", error);
    throw new Error("Não foi possível buscar as compras");
  }
};

export const getCustomerServices = async (
  customerId: string
): Promise<Array<{
  id: string;
  date: string;
  type: string;
  description: string;
  status: string;
}>> => {
  try {
    // Usar apenas customerId e orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, SALES_COLLECTION),
      where("customerId", "==", customerId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Filtrar apenas vendas que contêm serviços e estão concluídas
    const servicesData = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const sale = {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
        } as Sale;

        // Filtrar apenas vendas concluídas
        if (sale.status !== "completed") {
          return null;
        }

        // Buscar itens do tipo serviço
        const serviceItems = sale.items.filter((item) => item.type === "service");

        if (serviceItems.length === 0) {
          return null;
        }

        return serviceItems.map((item, index) => ({
          id: `${sale.id}_${index}`,
          date: sale.date.toISOString(),
          type: item.name,
          description: `Quantidade: ${item.quantity} - Total: R$ ${item.subtotal.toFixed(2)}`,
          status: "Concluído",
        }));
      })
      .filter((service): service is NonNullable<typeof service> => service !== null)
      .flat();

    return servicesData;
  } catch (error) {
    console.error("Erro ao buscar serviços do cliente:", error);
    throw new Error("Não foi possível buscar os serviços");
  }
};

// ==================== CAIXA ====================

export const openCashRegister = async (
  employeeId: string,
  employeeName: string,
  openingAmount: number = 0
): Promise<string> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se já existe caixa aberto hoje
    const existingCash = await getTodayCashRegister(employeeId);
    if (existingCash && existingCash.status === "open") {
      throw new Error("Já existe um caixa aberto para hoje");
    }

    const newCash: Omit<CashRegister, "id"> = {
      date: today,
      openingAmount,
      totalSales: 0,
      totalPayments: {
        pix: 0,
        debito: 0,
        credito: 0,
        dinheiro: 0,
      },
      sales: [],
      status: "open",
      employeeId,
      employeeName,
    };

    const docRef = await addDoc(
      collection(db, CASH_REGISTERS_COLLECTION),
      {
        ...newCash,
        date: Timestamp.fromDate(newCash.date),
        createdAt: new Date().toISOString(),
      }
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
    throw new Error(
      error instanceof Error ? error.message : "Não foi possível abrir o caixa"
    );
  }
};

export const getTodayCashRegister = async (
  employeeId?: string
): Promise<CashRegister | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar todos os caixas e filtrar em memória para evitar necessidade de índice
    let q;
    if (employeeId) {
      // Se temos employeeId, usar apenas esse filtro (não precisa de índice composto)
      q = query(
        collection(db, CASH_REGISTERS_COLLECTION),
        where("employeeId", "==", employeeId)
      );
    } else {
      // Sem employeeId, buscar todos
      q = query(collection(db, CASH_REGISTERS_COLLECTION));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Filtrar por data em memória
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    const todayCashRegisters = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const cashDate = data.date as Timestamp;
        
        // Verificar se a data está no intervalo de hoje
        if (cashDate >= todayTimestamp && cashDate < tomorrowTimestamp) {
          return {
            id: doc.id,
            ...data,
            date: cashDate.toDate(),
            sales: (data.sales || []).map((sale: any) => ({
              ...sale,
              date: sale.date?.toDate ? sale.date.toDate() : new Date(sale.date),
            })),
          } as CashRegister;
        }
        return null;
      })
      .filter((cash): cash is CashRegister => cash !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Ordenar por data desc

    if (todayCashRegisters.length === 0) {
      return null;
    }

    // Retornar o mais recente
    return todayCashRegisters[0];
  } catch (error) {
    console.error("Erro ao buscar caixa do dia:", error);
    throw new Error("Não foi possível buscar o caixa do dia");
  }
};

export const updateCashRegister = async (
  id: string,
  updates: Partial<CashRegister>
): Promise<void> => {
  try {
    const cashRef = doc(db, CASH_REGISTERS_COLLECTION, id);
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Converter Date para Timestamp se necessário
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    // Converter sales dates se necessário
    if (updates.sales) {
      updateData.sales = updates.sales.map((sale) => ({
        ...sale,
        date: Timestamp.fromDate(sale.date),
      }));
    }

    await updateDoc(cashRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar caixa:", error);
    throw new Error("Não foi possível atualizar o caixa");
  }
};

export const closeCashRegister = async (
  id: string,
  closingAmount: number
): Promise<void> => {
  try {
    const cashRef = doc(db, CASH_REGISTERS_COLLECTION, id);
    await updateDoc(cashRef, {
      closingAmount,
      status: "closed",
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    throw new Error("Não foi possível fechar o caixa");
  }
};

export const addSaleToCashRegister = async (
  cashRegisterId: string,
  sale: Sale
): Promise<void> => {
  try {
    const cashRef = doc(db, CASH_REGISTERS_COLLECTION, cashRegisterId);
    const cashDoc = await getDoc(cashRef);

    if (!cashDoc.exists()) {
      throw new Error("Caixa não encontrado");
    }

    const cashData = cashDoc.data() as any;
    const currentSales = cashData.sales || [];
    const currentTotalSales = cashData.totalSales || 0;
    const currentPayments = cashData.totalPayments || {
      pix: 0,
      debito: 0,
      credito: 0,
      dinheiro: 0,
    };

    await updateDoc(cashRef, {
      sales: [
        ...currentSales,
        {
          ...sale,
          date: Timestamp.fromDate(sale.date),
        },
      ],
      totalSales: currentTotalSales + sale.total,
      totalPayments: {
        ...currentPayments,
        [sale.payment.method]:
          currentPayments[sale.payment.method] + sale.total,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao adicionar venda ao caixa:", error);
    throw new Error("Não foi possível adicionar a venda ao caixa");
  }
};

// ==================== RELATÓRIOS ====================

export const getDailyReport = async (
  date: Date
): Promise<DailyReport | null> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await getSales(startOfDay, endOfDay);

    if (sales.length === 0) {
      return {
        date: date.toISOString(),
        totalSales: 0,
        totalTransactions: 0,
        paymentMethods: {
          pix: 0,
          debito: 0,
          credito: 0,
          dinheiro: 0,
        },
        sales: [],
      };
    }

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const paymentMethods = sales.reduce(
      (acc, sale) => {
        acc[sale.payment.method] += sale.total;
        return acc;
      },
      {
        pix: 0,
        debito: 0,
        credito: 0,
        dinheiro: 0,
      }
    );

    return {
      date: date.toISOString(),
      totalSales,
      totalTransactions: sales.length,
      paymentMethods,
      sales,
    };
  } catch (error) {
    console.error("Erro ao gerar relatório diário:", error);
    throw new Error("Não foi possível gerar o relatório diário");
  }
};

// ==================== FUNÇÕES PARA DASHBOARD ====================

/**
 * Busca o total de vendas do dia atual
 */
export const getTodaySalesAmount = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await getSales(today, endOfDay);
    // Filtrar apenas vendas concluídas
    const completedSales = sales.filter((sale) => sale.status === "completed");
    
    return completedSales.reduce((sum, sale) => sum + sale.total, 0);
  } catch (error) {
    console.error("Erro ao buscar vendas do dia:", error);
    throw new Error("Não foi possível buscar as vendas do dia");
  }
};

/**
 * Conta o total de lavagens (serviços) realizadas no dia
 */
export const getTodayServicesCount = async (): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await getSales(today, endOfDay);
    // Filtrar apenas vendas concluídas
    const completedSales = sales.filter((sale) => sale.status === "completed");
    
    // Contar serviços vendidos
    let servicesCount = 0;
    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === "service") {
          servicesCount += item.quantity;
        }
      });
    });

    return servicesCount;
  } catch (error) {
    console.error("Erro ao contar lavagens do dia:", error);
    throw new Error("Não foi possível contar as lavagens do dia");
  }
};

/**
 * Busca o valor total do caixa atual (aberto)
 */
export const getCurrentCashAmount = async (): Promise<number> => {
  try {
    const cashRegister = await getTodayCashRegister();
    
    if (!cashRegister || cashRegister.status !== "open") {
      return 0;
    }

    // Valor do caixa = valor de abertura + total de vendas
    return cashRegister.openingAmount + cashRegister.totalSales;
  } catch (error) {
    console.error("Erro ao buscar valor do caixa:", error);
    throw new Error("Não foi possível buscar o valor do caixa");
  }
};

/**
 * Busca vendas de um período específico (para comparação)
 */
export const getSalesAmountByPeriod = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const sales = await getSales(startDate, endDate);
    // Filtrar apenas vendas concluídas
    const completedSales = sales.filter((sale) => sale.status === "completed");
    
    return completedSales.reduce((sum, sale) => sum + sale.total, 0);
  } catch (error) {
    console.error("Erro ao buscar vendas do período:", error);
    throw new Error("Não foi possível buscar as vendas do período");
  }
};

/**
 * Conta serviços realizados em um período específico
 */
export const getServicesCountByPeriod = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const sales = await getSales(startDate, endDate);
    // Filtrar apenas vendas concluídas
    const completedSales = sales.filter((sale) => sale.status === "completed");
    
    let servicesCount = 0;
    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === "service") {
          servicesCount += item.quantity;
        }
      });
    });

    return servicesCount;
  } catch (error) {
    console.error("Erro ao contar serviços do período:", error);
    throw new Error("Não foi possível contar os serviços do período");
  }
};

/**
 * Busca o caixa de uma data específica
 */
export const getCashRegisterByDate = async (
  date: Date,
  employeeId?: string
): Promise<CashRegister | null> => {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Buscar todos os caixas e filtrar em memória
    let q;
    if (employeeId) {
      q = query(
        collection(db, CASH_REGISTERS_COLLECTION),
        where("employeeId", "==", employeeId)
      );
    } else {
      q = query(collection(db, CASH_REGISTERS_COLLECTION));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Filtrar por data em memória
    const targetTimestamp = Timestamp.fromDate(targetDate);
    const nextDayTimestamp = Timestamp.fromDate(nextDay);

    const dateCashRegisters = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const cashDate = data.date as Timestamp;
        
        // Verificar se a data está no intervalo desejado
        if (cashDate >= targetTimestamp && cashDate < nextDayTimestamp) {
          return {
            id: doc.id,
            ...data,
            date: cashDate.toDate(),
            sales: (data.sales || []).map((sale: any) => ({
              ...sale,
              date: sale.date?.toDate ? sale.date.toDate() : new Date(sale.date),
            })),
          } as CashRegister;
        }
        return null;
      })
      .filter((cash): cash is CashRegister => cash !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (dateCashRegisters.length === 0) {
      return null;
    }

    // Retornar o mais recente
    return dateCashRegisters[0];
  } catch (error) {
    console.error("Erro ao buscar caixa da data:", error);
    throw new Error("Não foi possível buscar o caixa da data");
  }
};

/**
 * Busca o valor total do caixa de uma data específica
 */
export const getCashAmountByDate = async (
  date: Date,
  employeeId?: string
): Promise<number> => {
  try {
    const cashRegister = await getCashRegisterByDate(date, employeeId);
    
    if (!cashRegister) {
      return 0;
    }

    // Se o caixa estiver fechado, usar o valor de fechamento
    // Se estiver aberto, usar abertura + vendas
    if (cashRegister.status === "closed" && cashRegister.closingAmount !== undefined) {
      return cashRegister.closingAmount;
    }
    
    return cashRegister.openingAmount + cashRegister.totalSales;
  } catch (error) {
    console.error("Erro ao buscar valor do caixa da data:", error);
    throw new Error("Não foi possível buscar o valor do caixa da data");
  }
};

/**
 * Busca vendas agrupadas por dia para um período (últimos 7 dias por padrão)
 */
export const getDailySalesData = async (
  days: number = 7
): Promise<Array<{ date: string; amount: number }>> => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sales = await getSales(startDate, endDate);
    const completedSales = sales.filter((sale) => sale.status === "completed");

    // Agrupar por dia
    const salesByDay = new Map<string, number>();

    // Inicializar todos os dias com 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      salesByDay.set(dateKey, 0);
    }

    // Somar vendas por dia
    completedSales.forEach((sale) => {
      const saleDate = sale.date.toISOString().split("T")[0];
      const currentAmount = salesByDay.get(saleDate) || 0;
      salesByDay.set(saleDate, currentAmount + sale.total);
    });

    // Converter para array e ordenar
    return Array.from(salesByDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Erro ao buscar dados de vendas diárias:", error);
    throw new Error("Não foi possível buscar os dados de vendas diárias");
  }
};

/**
 * Busca os serviços mais vendidos em um período
 */
export const getTopSellingServices = async (
  days: number = 30,
  limit: number = 5
): Promise<Array<{ name: string; quantity: number; revenue: number }>> => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sales = await getSales(startDate, endDate);
    const completedSales = sales.filter((sale) => sale.status === "completed");

    // Agrupar serviços por nome
    const servicesMap = new Map<
      string,
      { quantity: number; revenue: number }
    >();

    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.type === "service") {
          const current = servicesMap.get(item.name) || {
            quantity: 0,
            revenue: 0,
          };
          servicesMap.set(item.name, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + item.subtotal,
          });
        }
      });
    });

    // Converter para array, ordenar por quantidade e limitar
    return Array.from(servicesMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  } catch (error) {
    console.error("Erro ao buscar serviços mais vendidos:", error);
    throw new Error("Não foi possível buscar os serviços mais vendidos");
  }
};

