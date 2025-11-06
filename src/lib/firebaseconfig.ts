import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnPTDbFVZA9o0rUZi8MdrrFkybwb7Kjqo",
  authDomain: "goldcury-24db9.firebaseapp.com",
  projectId: "goldcury-24db9",
  storageBucket: "goldcury-24db9.firebasestorage.app",
  messagingSenderId: "872072121733",
  appId: "1:872072121733:web:9db7270d4c2a3b951408ec",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export { app };
export default firebaseConfig;



