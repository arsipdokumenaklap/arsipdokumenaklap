import { createContext, useState, useLayoutEffect, useCallback, useMemo } from "react";

// Mode gelap/terang dipakai bersama oleh halaman Login dan seluruh aplikasi,
// jadi menekan tombol di mana pun otomatis mengubah semuanya.
// Pilihan disimpan di browser (localStorage "tema") dan class "dark" dipasang di <html>.
export const TemaContext = createContext({
  gelap: false,
  setGelap: () => {},
  toggleTema: () => {},
});

export function TemaProvider({ children }) {
  const [gelap, setGelap] = useState(() => {
    try {
      return localStorage.getItem("tema") === "gelap";
    } catch {
      return false;
    }
  });

  // useLayoutEffect: class dipasang sebelum layar digambar, jadi tidak ada kedipan terang
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", gelap);
    try {
      localStorage.setItem("tema", gelap ? "gelap" : "terang");
    } catch {
      /* penyimpanan browser tidak tersedia, abaikan */
    }
  }, [gelap]);

  const toggleTema = useCallback(() => setGelap((g) => !g), []);

  const nilai = useMemo(() => ({ gelap, setGelap, toggleTema }), [gelap, toggleTema]);

  return <TemaContext.Provider value={nilai}>{children}</TemaContext.Provider>;
}
