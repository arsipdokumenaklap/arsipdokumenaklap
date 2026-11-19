import { useState, useRef, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { FaCalendarAlt, FaChevronDown, FaCheck } from "react-icons/fa";
import { TahunContext } from "../context/TahunContext";

// Pilihan Tahun Anggaran: hanya 5 baris yang tampak, sisanya digulir.
// Daftar dipasang di <body> (createPortal) supaya tidak terpotong sidebar.
// varian "sidebar" = kotak lebar di sidebar, "topbar" = tombol kecil "TA 2026" di bar atas HP.
const TINGGI_BARIS = 40; // px, harus sama dengan .pt-item
const BARIS_TERLIHAT = 5;
const TINGGI_DAFTAR = TINGGI_BARIS * BARIS_TERLIHAT + 8;

function PilihTahun({ varian = "sidebar" }) {
  const { tahun, setTahun, daftarTahun } = useContext(TahunContext);
  const [buka, setBuka] = useState(false);
  const [posisi, setPosisi] = useState({ top: 0, left: 0, lebar: 160, atas: false });
  const [aktif, setAktif] = useState(0);
  const tombolRef = useRef(null);
  const daftarRef = useRef(null);

  const indeksTerpilih = Math.max(
    0,
    daftarTahun.findIndex((t) => Number(t) === Number(tahun))
  );

  const hitungPosisi = () => {
    const k = tombolRef.current?.getBoundingClientRect();
    if (!k) return;
    const lebar = Math.max(k.width, 150);
    // rata kanan untuk tombol di topbar, rata kiri untuk kotak di sidebar
    let left = varian === "topbar" ? k.right - lebar : k.left;
    left = Math.min(Math.max(8, left), window.innerWidth - lebar - 8);
    const atas = k.bottom + TINGGI_DAFTAR + 12 > window.innerHeight && k.top > TINGGI_DAFTAR + 12;
    setPosisi({
      top: atas ? k.top - TINGGI_DAFTAR - 8 : k.bottom + 8,
      left,
      lebar,
    });
  };

  const bukaDaftar = () => {
    hitungPosisi();
    setAktif(indeksTerpilih);
    setBuka(true);
  };
  const tutupDaftar = () => setBuka(false);

  const pilih = (t) => {
    setTahun(t);
    tutupDaftar();
    tombolRef.current?.focus();
  };

  // tahun terpilih diletakkan di tengah daftar saat dibuka
  useEffect(() => {
    if (!buka || !daftarRef.current) return;
    daftarRef.current.scrollTop = Math.max(0, indeksTerpilih * TINGGI_BARIS - TINGGI_BARIS * 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buka]);

  // baris yang disorot lewat keyboard selalu terlihat
  useEffect(() => {
    if (!buka) return;
    daftarRef.current?.children[aktif]?.scrollIntoView({ block: "nearest" });
  }, [aktif, buka]);

  // klik di luar / ubah ukuran layar menutup daftar
  useEffect(() => {
    if (!buka) return;
    const saatKlik = (e) => {
      if (tombolRef.current?.contains(e.target)) return;
      if (daftarRef.current?.contains(e.target)) return;
      tutupDaftar();
    };
    document.addEventListener("mousedown", saatKlik);
    window.addEventListener("resize", tutupDaftar);
    return () => {
      document.removeEventListener("mousedown", saatKlik);
      window.removeEventListener("resize", tutupDaftar);
    };
  }, [buka]);

  const saatTombol = (e) => {
    if (!buka) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        bukaDaftar();
      }
      return;
    }
    const n = daftarTahun.length;
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      tutupDaftar();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktif((i) => Math.min(n - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktif((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setAktif(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setAktif(n - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pilih(daftarTahun[aktif]);
    }
  };

  const topbar = varian === "topbar";

  return (
    <>
      <style>{`
        @keyframes pt-masuk {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pt-daftar {
          position: fixed;
          z-index: 90;
          margin: 0;
          padding: 4px;
          list-style: none;
          overflow-y: auto;
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 0.6rem;
          box-shadow: 0 14px 34px rgba(30, 64, 175, 0.28);
          animation: pt-masuk 0.16s ease-out;
          scrollbar-width: thin;
          scrollbar-color: #93c5fd transparent;
        }
        .pt-item {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.8rem;
          border-radius: 0.45rem;
          cursor: pointer;
          color: #1e293b;
          transition: background-color 0.12s ease;
        }
        .pt-item.aktif { background: #eff6ff; }
        .pt-item.terpilih { color: #1d4ed8; font-weight: 600; }
        .dark .pt-daftar {
          background: #0b1030;
          border-color: rgba(99, 112, 255, 0.6);
          box-shadow: 0 0 0 1px rgba(99, 112, 255, 0.25), 0 0 26px rgba(79, 70, 229, 0.45);
          scrollbar-color: #6366f1 transparent;
        }
        .dark .pt-item { color: #cdd5ff; }
        .dark .pt-item.aktif { background: rgba(99, 102, 241, 0.2); }
        .dark .pt-item.terpilih {
          color: #67e8f9;
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.3), rgba(124, 58, 237, 0.25));
          box-shadow: inset 0 0 0 1px rgba(110, 140, 255, 0.5);
        }
      `}</style>

      <button
        ref={tombolRef}
        type="button"
        onClick={() => (buka ? tutupDaftar() : bukaDaftar())}
        onKeyDown={saatTombol}
        aria-haspopup="listbox"
        aria-expanded={buka}
        aria-label={`Tahun Anggaran ${tahun}, klik untuk mengganti`}
        className={
          topbar
            ? "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-sm font-medium transition"
            : "w-full flex items-center gap-3 bg-white/15 hover:bg-white/20 border border-white/25 rounded-lg px-3 py-2.5 text-left transition active:scale-[0.98]"
        }
      >
        {topbar ? (
          <>
            <span>TA {tahun}</span>
            <FaChevronDown
              className={`text-[10px] transition-transform duration-200 ${buka ? "rotate-180" : ""}`}
            />
          </>
        ) : (
          <>
            <FaCalendarAlt className="text-white shrink-0" />
            <span className="leading-tight flex-1">
              <span className="block text-xs text-blue-100">Tahun Anggaran</span>
              <span className="block font-bold text-lg">{tahun}</span>
            </span>
            <FaChevronDown
              className={`text-xs text-blue-100 shrink-0 transition-transform duration-200 ${
                buka ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {buka &&
        createPortal(
          <ul
            ref={daftarRef}
            role="listbox"
            aria-label="Tahun Anggaran"
            className="pt-daftar"
            style={{
              top: posisi.top,
              left: posisi.left,
              width: posisi.lebar,
              maxHeight: TINGGI_DAFTAR,
            }}
          >
            {daftarTahun.map((t, i) => {
              const terpilih = Number(t) === Number(tahun);
              return (
                <li
                  key={t}
                  role="option"
                  aria-selected={terpilih}
                  onMouseEnter={() => setAktif(i)}
                  onClick={() => pilih(t)}
                  className={`pt-item ${terpilih ? "terpilih" : ""} ${i === aktif ? "aktif" : ""}`}
                >
                  <span>{t}</span>
                  {terpilih && <FaCheck className="text-xs" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}

export default PilihTahun;
