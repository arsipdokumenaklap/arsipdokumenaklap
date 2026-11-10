import { createContext, useState, useEffect, useContext, useMemo } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  deleteField,
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

function waktuHapus(d) {
  return d.dihapusPada?.toMillis ? d.dihapusPada.toMillis() : Number.MAX_SAFE_INTEGER;
}

export function DocumentProvider({ children }) {
  const { tahun } = useContext(TahunContext);
  // semua dokumen tahun ini (termasuk yang ada di Sampah)
  const [semuaDokumen, setSemuaDokumen] = useState([]);
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
        setSemuaDokumen([]);
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

          setSemuaDokumen(daftar);
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

  // documents = dokumen aktif (dipakai Arsip, Dashboard, Laporan).
  // sampah = dokumen yang sudah dihapus tapi masih bisa dipulihkan.
  const documents = useMemo(() => semuaDokumen.filter((d) => !d.dihapus), [semuaDokumen]);
  const sampah = useMemo(
    () =>
      semuaDokumen
        .filter((d) => d.dihapus)
        .sort((a, b) => waktuHapus(b) - waktuHapus(a)),
    [semuaDokumen]
  );

  // Hapus = pindahkan ke Sampah (data dan file di Drive tidak dihilangkan)
  const pindahKeSampah = async (id) => {
    const user = getAuth().currentUser;
    let nama = "";
    if (user) {
      try {
        const snap = await getDoc(firestoreDoc(db, "users", user.uid));
        if (snap.exists()) nama = snap.data().nama || "";
      } catch (e) {
        console.log(e);
      }
    }

    await updateDoc(firestoreDoc(db, "documents", id), {
      dihapus: true,
      dihapusPada: serverTimestamp(),
      dihapusOleh: nama || user?.email || "-",
      dihapusOlehEmail: user?.email || "",
      dihapusOlehUid: user?.uid || "",
    });
  };

  // kembalikan dokumen dari Sampah ke Arsip
  const pulihkan = async (id) => {
    await updateDoc(firestoreDoc(db, "documents", id), {
      dihapus: false,
      dihapusPada: deleteField(),
      dihapusOleh: deleteField(),
      dihapusOlehEmail: deleteField(),
      dihapusOlehUid: deleteField(),
    });
  };

  // hapus selamanya dari daftar (tidak bisa dipulihkan)
  const hapusPermanen = async (id) => {
    await deleteDoc(firestoreDoc(db, "documents", id));
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        sampah,
        addDocument,
        pindahKeSampah,
        pulihkan,
        hapusPermanen,
        // nama lama dipertahankan supaya kode lain yang masih memakainya tetap jalan
        deleteDocument: pindahKeSampah,
        loading,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}