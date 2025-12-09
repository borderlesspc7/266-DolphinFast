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
import type { PlanoLavagem, PlanoLavagemFormData } from "../types/planosLavagem";

// Coleção do Firestore
const PLANOS_LAVAGEM_COLLECTION = "planosLavagem";

// ==================== PLANOS DE LAVAGEM ====================

export const createPlanoLavagem = async (
  planoData: PlanoLavagemFormData
): Promise<string> => {
  try {
    const novoPlano = {
      ...planoData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, PLANOS_LAVAGEM_COLLECTION),
      novoPlano
    );

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar plano de lavagem:", error);
    throw new Error("Não foi possível criar o plano de lavagem");
  }
};

export const updatePlanoLavagem = async (
  id: string,
  planoData: Partial<PlanoLavagemFormData>
): Promise<void> => {
  try {
    const planoRef = doc(db, PLANOS_LAVAGEM_COLLECTION, id);
    await updateDoc(planoRef, {
      ...planoData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar plano de lavagem:", error);
    throw new Error("Não foi possível atualizar o plano de lavagem");
  }
};

export const deletePlanoLavagem = async (id: string): Promise<void> => {
  try {
    const planoRef = doc(db, PLANOS_LAVAGEM_COLLECTION, id);
    await deleteDoc(planoRef);
  } catch (error) {
    console.error("Erro ao deletar plano de lavagem:", error);
    throw new Error("Não foi possível deletar o plano de lavagem");
  }
};

export const getPlanoLavagem = async (
  id: string
): Promise<PlanoLavagem | null> => {
  try {
    const planoRef = doc(db, PLANOS_LAVAGEM_COLLECTION, id);
    const planoDoc = await getDoc(planoRef);

    if (planoDoc.exists()) {
      return { id: planoDoc.id, ...planoDoc.data() } as PlanoLavagem;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar plano de lavagem:", error);
    throw new Error("Não foi possível buscar o plano de lavagem");
  }
};

export const getAllPlanosLavagem = async (): Promise<PlanoLavagem[]> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, PLANOS_LAVAGEM_COLLECTION),
        orderBy("createdAt", "desc")
      )
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PlanoLavagem[];
  } catch (error) {
    console.error("Erro ao buscar planos de lavagem:", error);
    throw new Error("Não foi possível buscar os planos de lavagem");
  }
};

export const getActivePlanosLavagem = async (): Promise<PlanoLavagem[]> => {
  try {
    const q = query(
      collection(db, PLANOS_LAVAGEM_COLLECTION),
      where("ativo", "==", true),
      orderBy("nome", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PlanoLavagem[];
  } catch (error) {
    console.error("Erro ao buscar planos ativos:", error);
    throw new Error("Não foi possível buscar os planos ativos");
  }
};

export const getPlanosByTipoVeiculo = async (
  tipoVeiculo: PlanoLavagem["tipoVeiculo"]
): Promise<PlanoLavagem[]> => {
  try {
    const q = query(
      collection(db, PLANOS_LAVAGEM_COLLECTION),
      where("tipoVeiculo", "==", tipoVeiculo),
      where("ativo", "==", true),
      orderBy("preco", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PlanoLavagem[];
  } catch (error) {
    console.error("Erro ao buscar planos por tipo de veículo:", error);
    throw new Error("Não foi possível buscar os planos por tipo de veículo");
  }
};


