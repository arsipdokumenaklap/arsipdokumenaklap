import { createContext, useState } from "react";

const KUNCI_PENYIMPANAN = "tahunAnggaran";
const TAHUN_INI = new Date().getFullYear();

// tahun paling awal yang ada di arsip (ubah angka ini sesuai kebutuhan).
// Tahun baru otomatis muncul setiap Januari, dan tahun lama tidak akan hilang dari daftar.
const TAHUN_AWAL = 2010;

// tahun yang bisa dipilih saat login: dari tahun depan sampai TAHUN_AWAL
const DAFTAR_TAHUN = Array.from(
  { length: TAHUN_INI + 1 - TAHUN_AWAL + 1 },
  (_, i) => TAHUN_INI + 1 - i
);

export const TahunContext = createContext(null);

function bacaTahunTersimpan() {
  try {
    const tersimpan = Number(localStorage.getItem(KUNCI_PENYIMPANAN));
    return DAFTAR_TAHUN.includes(tersimpan) ? tersimpan : TAHUN_INI;
  } catch {
    return TAHUN_INI;
  }
}

export function TahunProvider({ children }) {
  const [tahun, setTahunState] = useState(bacaTahunTersimpan);

  // dipanggil saat login (dan kalau nanti ada tombol ganti tahun di sidebar)
  const setTahun = (nilai) => {
    const angka = Number(nilai);
    setTahunState(angka);
    try {
      localStorage.setItem(KUNCI_PENYIMPANAN, String(angka));
    } catch {
      // abaikan kalau penyimpanan browser diblokir
    }
  };

  return (
    <TahunContext.Provider value={{ tahun, setTahun, daftarTahun: DAFTAR_TAHUN }}>
      {children}
    </TahunContext.Provider>
  );
}