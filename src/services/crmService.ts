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
  Customer,
  CustomerFormData,
  LoyaltyProgram,
  Promotion,
  Communication,
} from "../types/crm";

// Coleções do Firestore
const CUSTOMERS_COLLECTION = "customers";
const LOYALTY_PROGRAMS_COLLECTION = "loyaltyPrograms";
const PROMOTIONS_COLLECTION = "promotions";
const COMMUNICATIONS_COLLECTION = "communications";

// ==================== CLIENTES ====================

export const createCustomer = async (
  customerData: CustomerFormData
): Promise<string> => {
  try {
    const newCustomer = {
      ...customerData,
      loyaltyPoints: 0,
      totalPurchases: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, CUSTOMERS_COLLECTION),
      newCustomer
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw new Error("Não foi possível criar o cliente");
  }
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerFormData>
): Promise<void> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw new Error("Não foi possível atualizar o cliente");
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, id);
    await deleteDoc(customerRef);
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw new Error("Não foi possível deletar o cliente");
  }
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, id);
    const customerDoc = await getDoc(customerRef);

    if (customerDoc.exists()) {
      return { id: customerDoc.id, ...customerDoc.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    throw new Error("Não foi possível buscar o cliente");
  }
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, CUSTOMERS_COLLECTION), orderBy("createdAt", "desc"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw new Error("Não foi possível buscar os clientes");
  }
};

export const getActiveCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[];
  } catch (error) {
    console.error("Erro ao buscar clientes ativos:", error);
    throw new Error("Não foi possível buscar os clientes ativos");
  }
};

export const addLoyaltyPoints = async (
  customerId: string,
  points: number
): Promise<void> => {
  try {
    const customer = await getCustomer(customerId);
    if (!customer) throw new Error("Cliente não encontrado");

    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      loyaltyPoints: customer.loyaltyPoints + points,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao adicionar pontos:", error);
    throw new Error("Não foi possível adicionar pontos");
  }
};

export const redeemLoyaltyPoints = async (
  customerId: string,
  points: number
): Promise<void> => {
  try {
    const customer = await getCustomer(customerId);
    if (!customer) throw new Error("Cliente não encontrado");
    if (customer.loyaltyPoints < points)
      throw new Error("Pontos insuficientes");

    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      loyaltyPoints: customer.loyaltyPoints - points,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao resgatar pontos:", error);
    throw new Error("Não foi possível resgatar pontos");
  }
};

// ==================== PROGRAMAS DE FIDELIDADE ====================

export const createLoyaltyProgram = async (
  programData: Omit<LoyaltyProgram, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const newProgram = {
      ...programData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, LOYALTY_PROGRAMS_COLLECTION),
      newProgram
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar programa de fidelidade:", error);
    throw new Error("Não foi possível criar o programa de fidelidade");
  }
};

export const updateLoyaltyProgram = async (
  id: string,
  programData: Partial<LoyaltyProgram>
): Promise<void> => {
  try {
    const programRef = doc(db, LOYALTY_PROGRAMS_COLLECTION, id);
    await updateDoc(programRef, {
      ...programData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar programa de fidelidade:", error);
    throw new Error("Não foi possível atualizar o programa de fidelidade");
  }
};

export const getAllLoyaltyPrograms = async (): Promise<LoyaltyProgram[]> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, LOYALTY_PROGRAMS_COLLECTION),
        orderBy("createdAt", "desc")
      )
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LoyaltyProgram[];
  } catch (error) {
    console.error("Erro ao buscar programas de fidelidade:", error);
    throw new Error("Não foi possível buscar os programas de fidelidade");
  }
};

// ==================== PROMOÇÕES ====================

export const createPromotion = async (
  promotionData: Omit<Promotion, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const newPromotion = {
      ...promotionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, PROMOTIONS_COLLECTION),
      newPromotion
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    throw new Error("Não foi possível criar a promoção");
  }
};

export const updatePromotion = async (
  id: string,
  promotionData: Partial<Promotion>
): Promise<void> => {
  try {
    const promotionRef = doc(db, PROMOTIONS_COLLECTION, id);
    await updateDoc(promotionRef, {
      ...promotionData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar promoção:", error);
    throw new Error("Não foi possível atualizar a promoção");
  }
};

export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const promotionRef = doc(db, PROMOTIONS_COLLECTION, id);
    await deleteDoc(promotionRef);
  } catch (error) {
    console.error("Erro ao deletar promoção:", error);
    throw new Error("Não foi possível deletar a promoção");
  }
};

export const getAllPromotions = async (): Promise<Promotion[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, PROMOTIONS_COLLECTION), orderBy("createdAt", "desc"))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Promotion[];
  } catch (error) {
    console.error("Erro ao buscar promoções:", error);
    throw new Error("Não foi possível buscar as promoções");
  }
};

export const getActivePromotions = async (): Promise<Promotion[]> => {
  try {
    const now = new Date().toISOString();
    const q = query(
      collection(db, PROMOTIONS_COLLECTION),
      where("active", "==", true),
      where("validUntil", ">=", now)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Promotion[];
  } catch (error) {
    console.error("Erro ao buscar promoções ativas:", error);
    throw new Error("Não foi possível buscar as promoções ativas");
  }
};

// ==================== COMUNICAÇÕES ====================

export const createCommunication = async (
  communicationData: Omit<Communication, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const newCommunication = {
      ...communicationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, COMMUNICATIONS_COLLECTION),
      newCommunication
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar comunicação:", error);
    throw new Error("Não foi possível criar a comunicação");
  }
};

export const updateCommunication = async (
  id: string,
  communicationData: Partial<Communication>
): Promise<void> => {
  try {
    const communicationRef = doc(db, COMMUNICATIONS_COLLECTION, id);
    await updateDoc(communicationRef, {
      ...communicationData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar comunicação:", error);
    throw new Error("Não foi possível atualizar a comunicação");
  }
};

export const deleteCommunication = async (id: string): Promise<void> => {
  try {
    const communicationRef = doc(db, COMMUNICATIONS_COLLECTION, id);
    await deleteDoc(communicationRef);
  } catch (error) {
    console.error("Erro ao deletar comunicação:", error);
    throw new Error("Não foi possível deletar a comunicação");
  }
};

export const getAllCommunications = async (): Promise<Communication[]> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COMMUNICATIONS_COLLECTION),
        orderBy("createdAt", "desc")
      )
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Communication[];
  } catch (error) {
    console.error("Erro ao buscar comunicações:", error);
    throw new Error("Não foi possível buscar as comunicações");
  }
};

export const sendCommunication = async (id: string): Promise<void> => {
  try {
    // Aqui você integraria com serviços de envio (SendGrid, Twilio, WhatsApp Business API, etc.)
    // Por enquanto, apenas marcamos como enviado
    const communicationRef = doc(db, COMMUNICATIONS_COLLECTION, id);
    await updateDoc(communicationRef, {
      status: "sent",
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao enviar comunicação:", error);
    throw new Error("Não foi possível enviar a comunicação");
  }
};
