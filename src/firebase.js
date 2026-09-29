import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsXcN9fJxFe1tDiDm7V1ZR_c3rKhkk1Co",
  authDomain: "arsip-dokumen-aklap.firebaseapp.com",
  projectId: "arsip-dokumen-aklap",
  storageBucket: "arsip-dokumen-aklap.firebasestorage.app",
  messagingSenderId: "488403338965",
  appId: "1:488403338965:web:cadc8f05a71e8f030b845c",
  measurementId: "G-25QCYFE6JX",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);