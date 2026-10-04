import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc as firestoreDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase"; // sesuaikan dengan path file firebase kamu
import { TahunContext } from "./TahunContext";

export const DocumentContext = createContext();

// dokumen yang baru disimpan belum punya waktu dari server, anggap paling baru
function waktuDokumen(d) {
  return d.createdAt?.toMillis ? d.createdAt.toMillis() : Number.MAX_SAFE_INTEGER;
}

export function DocumentProvider({ children }) {
  const { tahun } = useContext(TahunContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // dibaca ulang setiap tahun anggaran berganti
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

      // sudah login: baca hanya dokumen milik tahun anggaran yang dipilih.
      // Urutan terbaru di atas dilakukan di sini (bukan di query), supaya
      // tidak perlu membuat index tambahan di Firebase.
      setLoading(true);
      const q = query(
        collection(db, "documents"),
        where("tahunAnggaran", "==", tahun)
      );

      unsubDocs = onSnapshot(
        q,
        (snapshot) => {
          const daftar = snapshot.docs
            .map((d) => ({ ...d.data(), id: d.id }))
            .sort((a, b) => waktuDokumen(b) - waktuDokumen(a));

          setDocuments(daftar);
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
  }, [tahun]);

  const addDocument = async (data) => {
    await addDoc(collection(db, "documents"), {
      ...data,
      // pakai tahun yang dikirim pemanggil (dikunci saat upload dimulai),
      // kalau tidak ada baru pakai tahun yang sedang aktif
      tahunAnggaran: data.tahunAnggaran ?? tahun,
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