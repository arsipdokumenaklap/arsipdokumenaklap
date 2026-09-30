import { createContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc as firestoreDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase"; // sesuaikan dengan path file firebase kamu

export const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setDocuments(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      },
      (error) => {
        console.error("Gagal memuat dokumen:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const addDocument = async (data) => {
    await addDoc(collection(db, "documents"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const deleteDocument = async (id) => {
    await deleteDoc(firestoreDoc(db, "documents", id));
  };

  return (
    <DocumentContext.Provider
      value={{ documents, addDocument, deleteDocument, loading }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
