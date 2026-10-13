import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { DocumentContext } from "./DocumentContext";
import { TahunContext } from "./TahunContext";
import { uploadKeDrive } from "../driveUpload";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const UploadContext = createContext();

// Siapa yang mengupload: nama diambil dari profil (users/{uid}),
// kalau profil belum diisi dipakai email akunnya.
async function ambilPengunggah() {
  const user = auth.currentUser;
  if (!user) return { nama: "-", email: "", uid: "" };

  let nama = "";
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) nama = snap.data().nama || "";
  } catch (error) {
    console.log(error);
  }

  return {
    nama: nama || user.email || "-",
    email: user.email || "",
    uid: user.uid,
  };
}

// Upload dijalankan di sini (bukan di halaman Upload), jadi tetap berjalan
// walaupun pengguna pindah ke menu lain.
export function UploadProvider({ children }) {
  const { addDocument } = useContext(DocumentContext);
  const { tahun } = useContext(TahunContext);
  const [antrian, setAntrian] = useState([]);

  const ubahItem = useCallback((id, perubahan) => {
    setAntrian((lama) =>
      lama.map((it) => (it.id === id ? { ...it, ...perubahan } : it))
    );
  }, []);

  const mulaiUpload = useCallback(
    async (payload) => {
      const { file, nama, kategori, tipeFile } = payload;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // tahun dikunci saat upload dimulai, supaya percobaan ulang (atau pergantian
      // tahun lewat logout/login) tidak membuat file dan datanya beda tahun
      const tahunAnggaran = payload.tahunAnggaran ?? tahun;
      const payloadTersimpan = { ...payload, tahunAnggaran };

      setAntrian((lama) => [
        {
          id,
          nama,
          namaFile: file.name,
          ukuran: file.size,
          status: "mengupload",
          payload: payloadTersimpan,
        },
        ...lama,
      ]);

      try {
        // tahun ikut dikirim agar file masuk ke subfolder tahun yang sesuai
        const hasilDrive = await uploadKeDrive(file, tahunAnggaran);

        ubahItem(id, { status: "menyimpan" });

        const pengunggah = await ambilPengunggah();

        await addDocument({
          nama,
          namaFile: file.name,
          kategori,
          tipeFile,
          tahunAnggaran,
          diuploadOleh: pengunggah.nama,
          diuploadOlehEmail: pengunggah.email,
          diuploadOlehUid: pengunggah.uid,
          tanggal: new Date().toLocaleDateString(),
          driveId: hasilDrive.id ?? null,
          fileUrl: hasilDrive.downloadUrl ?? null,
          previewUrl: hasilDrive.previewUrl ?? null,
        });

        ubahItem(id, { status: "selesai" });
      } catch (error) {
        ubahItem(id, { status: "gagal", pesan: error.message });
      }
    },
    [addDocument, ubahItem, tahun]
  );

  const ulangi = (id) => {
    const item = antrian.find((it) => it.id === id);
    if (!item) return;
    setAntrian((lama) => lama.filter((it) => it.id !== id));
    mulaiUpload(item.payload);
  };

  const hapusItem = (id) =>
    setAntrian((lama) => lama.filter((it) => it.id !== id));

  const bersihkanSelesai = () =>
    setAntrian((lama) =>
      lama.filter((it) => it.status === "mengupload" || it.status === "menyimpan")
    );

  const adaUploadBerjalan = antrian.some(
    (it) => it.status === "mengupload" || it.status === "menyimpan"
  );

  // peringatan kalau tab ditutup/direfresh saat upload masih berjalan
  useEffect(() => {
    if (!adaUploadBerjalan) return;
    const cegah = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", cegah);
    return () => window.removeEventListener("beforeunload", cegah);
  }, [adaUploadBerjalan]);

  return (
    <UploadContext.Provider
      value={{
        antrian,
        mulaiUpload,
        ulangi,
        hapusItem,
        bersihkanSelesai,
        adaUploadBerjalan,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}