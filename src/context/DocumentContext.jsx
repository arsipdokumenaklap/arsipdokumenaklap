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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase"; // sesuaikan dengan path file firebase kamu

export const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDocs = null;

    const unsubAuth = onAuthStateChanged(getAuth(), (user) => {
      // hentikan pembacaan lama (kalau ada) setiap status login berubah
      if (unsubDocs) {
        unsubDocs();
        unsubDocs = null;
      }

      // belum login: kosongkan daftar, jangan baca Firestore dulu
      if (!user) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      // sudah login: mulai baca dokumen secara real-time
      setLoading(true);
      const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
      unsubDocs = onSnapshot(
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
    });

    return () => {
      unsubAuth();
      if (unsubDocs) unsubDocs();
    };
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