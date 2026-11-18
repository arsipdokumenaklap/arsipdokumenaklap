import { createContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FaTrashAlt,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";

// Dialog konfirmasi buatan sendiri, pengganti window.confirm bawaan browser.
//
// Cara pakai di halaman mana pun:
//   const konfirmasi = useContext(KonfirmasiContext);
//   const ya = await konfirmasi({
//     tipe: "sampah",              // "sampah" (oranye) | "bahaya" (merah) | "info" (biru)
//     judul: "Pindahkan ke Sampah?",
//     pesan: "Dokumen ini akan dipindahkan ke Sampah.",
//     detail: doc.nama,            // opsional: kotak kecil berisi nama dokumen
//     catatan: "Masih bisa dipulihkan.", // opsional: keterangan kecil di bawah
//     tombolYa: "Ya, Pindahkan",   // opsional
//     tombolBatal: "Batal",        // opsional
//   });
//   if (!ya) return;
//
// Untuk pemberitahuan biasa (pengganti alert, hanya tombol OK):
//   konfirmasi.info("Nama surat belum diisi", "Masukkan nama surat terlebih dahulu.", "peringatan");
//   jenis: "peringatan" (kuning) | "sukses" (hijau) | "galat" (merah) | "info" (biru)

// cadangan kalau provider belum dipasang: pakai dialog bawaan browser
const cadangan = (opsi) =>
  Promise.resolve(window.confirm(`${opsi.judul}\n\n${opsi.pesan || ""}`));
cadangan.info = (judul, pesan) => {
  window.alert(`${judul}\n\n${pesan || ""}`);
  return Promise.resolve(true);
};
export const KonfirmasiContext = createContext(cadangan);

const TIPE = {
  sampah: { ikon: FaTrashAlt, kelas: "sampah" },
  bahaya: { ikon: FaExclamationTriangle, kelas: "bahaya" },
  tanya: { ikon: FaQuestionCircle, kelas: "info" },
  peringatan: { ikon: FaExclamationTriangle, kelas: "peringatan" },
  sukses: { ikon: FaCheckCircle, kelas: "sukses" },
  galat: { ikon: FaTimesCircle, kelas: "bahaya" },
  info: { ikon: FaInfoCircle, kelas: "info" },
};

export function KonfirmasiProvider({ children }) {
  const [dlg, setDlg] = useState(null); // dialog yang sedang tampil
  const [menutup, setMenutup] = useState(false); // untuk animasi keluar
  const tombolBatal = useRef(null);
  const tombolYa = useRef(null);

  const konfirmasi = useCallback(
    (opsi) =>
      new Promise((resolve) => {
        setMenutup(false);
        setDlg({ tipe: "sampah", ...opsi, resolve });
      }),
    []
  );

  // pemberitahuan biasa: hanya satu tombol OK
  const nilai = useMemo(() => {
    const f = (opsi) => konfirmasi(opsi);
    f.info = (judul, pesan, tipe = "info") =>
      konfirmasi({ tipe, judul, pesan, tanpaBatal: true, tombolYa: "OK" });
    return f;
  }, [konfirmasi]);

  const tutup = useCallback(
    (hasil) => {
      if (!dlg || menutup) return;
      dlg.resolve(hasil);
      setMenutup(true);
      setTimeout(() => {
        setDlg(null);
        setMenutup(false);
      }, 160);
    },
    [dlg, menutup]
  );

  // fokus awal: tombol Batal untuk aksi berbahaya (supaya tidak tertekan tanpa sengaja)
  useEffect(() => {
    if (!dlg) return;
    const t = setTimeout(() => {
      (dlg.tanpaBatal || dlg.tipe === "tanya" ? tombolYa : tombolBatal).current?.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [dlg]);

  // Esc = batal, Tab berputar di antara dua tombol saja
  useEffect(() => {
    if (!dlg) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        tutup(Boolean(dlg.tanpaBatal));
      } else if (e.key === "Tab") {
        const a = tombolBatal.current;
        const b = tombolYa.current;
        if (!b) return;
        if (!a) {
          e.preventDefault(); // hanya satu tombol: fokus tetap di OK
          return;
        }
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dlg, tutup]);

  const tipe = dlg ? TIPE[dlg.tipe] || TIPE.sampah : null;
  const Ikon = tipe?.ikon;

  return (
    <KonfirmasiContext.Provider value={nilai}>
      {children}

      {dlg &&
        createPortal(
          <div
            className={`kd-latar fixed inset-0 z-[80] flex items-center justify-center p-4 ${
              menutup ? "kd-keluar" : ""
            }`}
            onClick={() => tutup(Boolean(dlg.tanpaBatal))}
          >
            <style>{`
              @keyframes kd-latar-masuk { from { opacity: 0; } to { opacity: 1; } }
              @keyframes kd-kartu-masuk {
                from { opacity: 0; transform: translateY(10px) scale(0.93); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes kd-keluar-anim { to { opacity: 0; } }
              @keyframes kd-ikon-goyang {
                0%, 100% { transform: rotate(0); }
                25% { transform: rotate(-9deg); }
                75% { transform: rotate(9deg); }
              }

              .kd-latar {
                background: rgba(15, 23, 42, 0.5);
                -webkit-backdrop-filter: blur(3px);
                backdrop-filter: blur(3px);
                animation: kd-latar-masuk 0.18s ease-out;
              }
              .kd-latar.kd-keluar { animation: kd-keluar-anim 0.16s ease-in forwards; }

              .kd-kartu {
                width: 100%;
                max-width: 28rem;
                border-radius: 1rem;
                padding: 1.5rem;
                background: #ffffff;
                color: #334155;
                border: 1px solid #e2e8f0;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.3);
                animation: kd-kartu-masuk 0.24s cubic-bezier(0.2, 0.9, 0.3, 1.15);
              }
              .kd-keluar .kd-kartu { opacity: 0; transform: scale(0.96); transition: all 0.16s ease-in; }

              .kd-ikon {
                width: 3rem; height: 3rem; border-radius: 9999px; flex-shrink: 0;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.15rem;
              }
              .kd-ikon svg { animation: kd-ikon-goyang 0.5s ease-in-out 0.25s; }

              .kd-judul { font-size: 1.125rem; font-weight: 700; color: #172554; margin: 0; }
              .kd-pesan { margin: 0.35rem 0 0; color: #475569; line-height: 1.5; }
              .kd-detail {
                margin-top: 0.85rem; padding: 0.55rem 0.8rem; border-radius: 0.6rem;
                background: #f1f5f9; border: 1px solid #e2e8f0; color: #1e293b;
                font-size: 0.875rem; font-weight: 500; word-break: break-word;
                display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
              }
              .kd-catatan { margin: 0.85rem 0 0; font-size: 0.8125rem; color: #64748b; }

              .kd-aksi { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
              .kd-btn {
                padding: 0.6rem 1.15rem; border-radius: 0.6rem; font-weight: 600; font-size: 0.9rem;
                border: 0; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.2s ease;
              }
              .kd-btn:active { transform: scale(0.96); }
              .kd-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
              .kd-btn-batal { background: #f1f5f9; color: #334155; }
              .kd-btn-batal:hover { background: #e2e8f0; }
              .kd-btn-ya { color: #ffffff; }
              .kd-btn-ya:hover { filter: brightness(1.08); }

              /* warna per jenis (terang) */
              .kd-sampah .kd-ikon { background: #ffedd5; color: #ea580c; }
              .kd-sampah .kd-btn-ya { background: linear-gradient(135deg, #f97316, #ea580c); }
              .kd-bahaya .kd-ikon { background: #ffe4e6; color: #e11d48; }
              .kd-bahaya .kd-btn-ya { background: linear-gradient(135deg, #f43f5e, #e11d48); }
              .kd-info .kd-ikon { background: #dbeafe; color: #2563eb; }
              .kd-info .kd-btn-ya { background: linear-gradient(135deg, #2563eb, #4f46e5); }
              .kd-peringatan .kd-ikon { background: #fef3c7; color: #d97706; }
              .kd-peringatan .kd-btn-ya { background: linear-gradient(135deg, #f59e0b, #d97706); }
              .kd-sukses .kd-ikon { background: #dcfce7; color: #16a34a; }
              .kd-sukses .kd-btn-ya { background: linear-gradient(135deg, #22c55e, #16a34a); }

              /* ===== mode gelap bergaya neon ===== */
              .dark .kd-latar { background: rgba(2, 3, 12, 0.72); }
              .dark .kd-kartu {
                background: linear-gradient(145deg, #141c44, #080c20);
                color: #cdd5ff;
                border-color: transparent;
              }
              .dark .kd-judul { color: #f5f7ff; }
              .dark .kd-pesan { color: #b6c0ee; }
              .dark .kd-detail { background: #070b22; border-color: rgba(99, 112, 255, 0.4); color: #e6eaff; }
              .dark .kd-catatan { color: #8f9bd3; }
              .dark .kd-btn-batal { background: rgba(99, 102, 241, 0.16); color: #cdd5ff; box-shadow: inset 0 0 0 1px rgba(99, 130, 255, 0.4); }
              .dark .kd-btn-batal:hover { background: rgba(99, 102, 241, 0.30); }

              .dark .kd-sampah .kd-kartu, .dark .kd-sampah.kd-kartu {
                box-shadow: 0 0 0 1px rgba(251, 146, 60, 0.6), 0 0 38px rgba(249, 115, 22, 0.32);
              }
              .dark .kd-sampah .kd-ikon { background: rgba(249, 115, 22, 0.18); color: #fdba74; box-shadow: 0 0 20px rgba(249, 115, 22, 0.55); }
              .dark .kd-sampah .kd-btn-ya { box-shadow: 0 0 18px rgba(249, 115, 22, 0.6); }

              .dark .kd-bahaya.kd-kartu { box-shadow: 0 0 0 1px rgba(251, 113, 133, 0.65), 0 0 40px rgba(244, 63, 94, 0.36); }
              .dark .kd-bahaya .kd-ikon { background: rgba(244, 63, 94, 0.18); color: #fda4af; box-shadow: 0 0 20px rgba(244, 63, 94, 0.6); }
              .dark .kd-bahaya .kd-btn-ya { box-shadow: 0 0 18px rgba(244, 63, 94, 0.65); }

              .dark .kd-info.kd-kartu { box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.65), 0 0 40px rgba(99, 102, 241, 0.4); }
              .dark .kd-info .kd-ikon { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
              .dark .kd-info .kd-btn-ya { box-shadow: 0 0 18px rgba(99, 102, 241, 0.65); }

              .dark .kd-peringatan.kd-kartu { box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.6), 0 0 38px rgba(245, 158, 11, 0.32); }
              .dark .kd-peringatan .kd-ikon { background: rgba(245, 158, 11, 0.18); color: #fcd34d; box-shadow: 0 0 20px rgba(245, 158, 11, 0.55); }
              .dark .kd-peringatan .kd-btn-ya { box-shadow: 0 0 18px rgba(245, 158, 11, 0.6); }

              .dark .kd-sukses.kd-kartu { box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.6), 0 0 38px rgba(16, 185, 129, 0.32); }
              .dark .kd-sukses .kd-ikon { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; box-shadow: 0 0 20px rgba(16, 185, 129, 0.55); }
              .dark .kd-sukses .kd-btn-ya { box-shadow: 0 0 18px rgba(16, 185, 129, 0.6); }

              @media (prefers-reduced-motion: reduce) {
                .kd-latar, .kd-kartu, .kd-ikon svg { animation: none; }
              }
            `}</style>

            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="kd-judul"
              aria-describedby="kd-pesan"
              className={`kd-kartu kd-${tipe.kelas}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-4">
                <div className="kd-ikon">
                  <Ikon />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 id="kd-judul" className="kd-judul">{dlg.judul}</h3>
                  {dlg.pesan && <p id="kd-pesan" className="kd-pesan">{dlg.pesan}</p>}
                  {dlg.detail && <div className="kd-detail">{dlg.detail}</div>}
                  {dlg.catatan && <p className="kd-catatan">{dlg.catatan}</p>}
                </div>
              </div>

              <div className="kd-aksi">
                {!dlg.tanpaBatal && (
                  <button
                    ref={tombolBatal}
                    type="button"
                    className="kd-btn kd-btn-batal"
                    onClick={() => tutup(false)}
                  >
                    {dlg.tombolBatal || "Batal"}
                  </button>
                )}
                <button
                  ref={tombolYa}
                  type="button"
                  className="kd-btn kd-btn-ya"
                  onClick={() => tutup(true)}
                >
                  {dlg.tombolYa || "Ya, Lanjutkan"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </KonfirmasiContext.Provider>
  );
}
