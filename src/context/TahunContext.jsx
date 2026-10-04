import { createContext, useState } from "react";

const KUNCI_PENYIMPANAN = "tahunAnggaran";
const TAHUN_INI = new Date().getFullYear();

// tahun yang bisa dipilih saat login: tahun depan sampai 4 tahun ke belakang
const DAFTAR_TAHUN = Array.from({ length: 6 }, (_, i) => TAHUN_INI + 1 - i);

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