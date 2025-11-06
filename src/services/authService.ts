import { auth, db } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface FirebaseError {
  code?: string;
  message?: string;
}

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado no sistema.");
      }

      const userData = userDoc.data();
      
      // Converter Timestamp do Firestore para Date
      const user: User = {
        ...userData,
        uid: userData.uid || firebaseUser.uid,
        email: userData.email || firebaseUser.email || "",
        name: userData.name || "",
        phone: userData.phone || "",
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
        updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(),
        lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : undefined,
        role: userData.role || "user",
      };

      const updateUserData = {
        ...user,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updateUserData, { merge: true });

      return {
        ...user,
        lastLogin: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Validação dos campos obrigatórios
      if (!credentials.email || !credentials.password || !credentials.name) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (credentials.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        email: credentials.email,
        name: credentials.name,
        phone: credentials.phone || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: credentials.role || "user", // Role padrão se não especificado
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      
      // Retornar User com Date convertido
      return {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    } catch (error: any) {
      const message = getFirebaseErrorMessage(error as string | FirebaseError);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    try {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        console.log(
          "🔄 Auth state changed:",
          firebaseUser ? firebaseUser.uid : "null"
        );

        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Converter Timestamp do Firestore para Date
              const user: User = {
                uid: userData.uid || firebaseUser.uid,
                email: userData.email || firebaseUser.email || "",
                name: userData.name || "",
                phone: userData.phone || "",
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
                updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(),
                lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : undefined,
                role: userData.role || "user",
              };
              
              console.log("✅ Usuário autenticado:", user);
              callback(user);
            } else {
              console.log("❌ Usuário não encontrado no Firestore");
              callback(null); // Usuário não encontrado no Firestore
            }
          } catch (error) {
            console.error("❌ Erro ao buscar dados do usuário:", error);
            callback(null);
          }
        } else {
          // Usuário não está logado
          console.log("🚪 Usuário deslogado");
          callback(null);
        }
      });
    } catch (error) {
      throw new Error("Erro ao observar estado de autenticação: " + error);
    }
  },
};
