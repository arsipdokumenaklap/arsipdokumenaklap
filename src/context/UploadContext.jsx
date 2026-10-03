import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { DocumentContext } from "./DocumentContext";
import { uploadKeDrive } from "../driveUpload";

export const UploadContext = createContext();

// Upload dijalankan di sini (bukan di halaman Upload), jadi tetap berjalan
// walaupun pengguna pindah ke menu lain.
export function UploadProvider({ children }) {
  const { addDocument } = useContext(DocumentContext);
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

      setAntrian((lama) => [
        {
          id,
          nama,
          namaFile: file.name,
          ukuran: file.size,
          status: "mengupload",
          payload,
        },
        ...lama,
      ]);

      try {
        const hasilDrive = await uploadKeDrive(file);

        ubahItem(id, { status: "menyimpan" });

        await addDocument({
          nama,
          namaFile: file.name,
          kategori,
          tipeFile,
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
    [addDocument, ubahItem]
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