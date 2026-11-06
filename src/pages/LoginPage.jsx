import { useState, useContext } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaChevronDown,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { TahunContext } from "../context/TahunContext";
import { TemaContext } from "../context/TemaContext";

// taruh file logo di src/assets/logo.png lalu import seperti ini,
// supaya alamatnya otomatis benar walau situs dipindah ke subfolder
import logo from "../assets/logo.png";
// gambar tim di dalam mobil (latar transparan), taruh di src/assets/mobil-tim.webp
import mobilTim from "../assets/mobil-tim.webp";

const acak = (min, max) => min + Math.random() * (max - min);

// posisi, ukuran, kecepatan tiap titik cahaya — dibuat sekali saja, bukan tiap render
const SALJU = Array.from({ length: 22 }).map((_, i) => ({
  id: i,
  left: acak(0, 100),
  size: acak(3, 8),
  durasi: acak(10, 22),
  tunda: acak(0, 22),
  opasitas: acak(0.15, 0.5),
}));

// bintang untuk suasana malam — juga dibuat sekali saja
const BINTANG = Array.from({ length: 48 }).map((_, i) => ({
  id: i,
  left: acak(2, 98),
  top: acak(2, 64),
  size: acak(1.5, 3.5),
  durasi: acak(2, 5),
  tunda: acak(0, 5),
}));

// bentuk awan dipakai berulang lewat <use>; didefinisikan sekali di dalam halaman
function DefAwan() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <g id="lp-awan-bentuk">
          <rect x="8" y="46" width="184" height="32" rx="16" />
          <circle cx="38" cy="56" r="19" />
          <circle cx="68" cy="45" r="25" />
          <circle cx="108" cy="34" r="31" />
          <circle cx="150" cy="48" r="23" />
        </g>
        {/* siang: putih di atas, kebiruan lembut di bawah */}
        <linearGradient id="lp-awan-siang" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="1" stopColor="#d3e5ff" stopOpacity="0.9" />
        </linearGradient>
        {/* malam: biru keunguan, tepi atas sedikit terang terkena cahaya bulan */}
        <linearGradient id="lp-awan-malam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b78c4" stopOpacity="0.6" />
          <stop offset="1" stopColor="#252d63" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// awan: hanyut pelan ke kanan-kiri sambil naik-turun; siang putih, malam kebiruan
// lebar dalam rem, hanyut = jarak geser (px), detik = lama satu kali geser
function Awan({ className = "", lebar = 11, lambat = false, hanyut = 40, detik = 40, opasitas = 1 }) {
  return (
    <div
      className={`absolute pointer-events-none lp-hanyut ${className}`}
      style={{ "--hanyut": `${hanyut}px`, animationDuration: `${detik}s`, opacity: opasitas }}
    >
      <div
        className={`lp-bentuk relative ${lambat ? "lambat" : ""}`}
        style={{ width: `${lebar}rem`, aspectRatio: "200 / 84" }}
      >
        <svg className="lp-awan-siang" viewBox="0 0 200 84" aria-hidden="true">
          <use href="#lp-awan-bentuk" fill="url(#lp-awan-siang)" />
        </svg>
        <svg className="lp-awan-malam" viewBox="0 0 200 84" aria-hidden="true">
          <use href="#lp-awan-bentuk" fill="url(#lp-awan-malam)" />
        </svg>
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tahun, setTahun, daftarTahun } = useContext(TahunContext);
  // mode gelap/terang yang sama dengan dashboard (satu pengaturan bersama)
  const { gelap, toggleTema } = useContext(TemaContext);
  const navigate = useNavigate();

  const handleLupaPassword = async () => {
    if (!email) {
      alert("Isi kolom Email dulu, lalu klik \"Lupa password?\" lagi.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Link reset password sudah dikirim ke " + email + ". Silakan cek email (termasuk folder spam).");
    } catch (error) {
      alert("Gagal mengirim email reset: " + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Login gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root min-h-screen flex bg-white">
      <style>{`
        @keyframes lp-apung {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .lp-bentuk { animation: lp-apung 6s ease-in-out infinite; }
        .lp-bentuk.lambat { animation-duration: 9s; }

        /* mobil menghadap ke kiri, jadi masuk dari kanan lalu berhenti di tengah */
        @keyframes lp-masuk {
          from { opacity: 0; transform: translateX(70vw); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .lp-mobil-masuk {
          animation: lp-masuk 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* goyangan halus seperti sedang melaju di jalan */
        @keyframes lp-melaju {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-5px) rotate(-0.5deg); }
          50%      { transform: translateY(0) rotate(0deg); }
          75%      { transform: translateY(-3px) rotate(0.4deg); }
        }
        .lp-mobil {
          animation: lp-melaju 0.8s ease-in-out infinite;
          transform-origin: 50% 90%;
        }

        /* mobil menghadap ke kiri: garis jalan bergeser ke kanan, jadi mobil terlihat maju.
           Ritme: jalan 0.4s, goyangan mobil 0.8s, angin 0.8s (semua kelipatan, jadi serasi) */
        @keyframes lp-jalan {
          from { background-position: 0 0; }
          to   { background-position: 64px 0; }
        }
        .lp-jalan {
          background-image: repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.75) 0 32px,
            transparent 32px 64px
          );
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
          animation: lp-jalan 0.4s linear infinite;
        }

        /* garis angin di belakang mobil (sisi kanan), mengalir menjauh ke kanan */
        @keyframes lp-angin {
          0%   { opacity: 0; transform: translateX(0); }
          30%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateX(40px); }
        }
        .lp-angin {
          position: absolute;
          height: 3px;
          border-radius: 9999px;
          background: #ffffff;
          animation: lp-angin 0.8s ease-out infinite;
        }

        @keyframes lp-turun {
          0%   { top: -6%; transform: translateX(0); }
          50%  { transform: translateX(12px); }
          100% { top: 106%; transform: translateX(-12px); }
        }
        .lp-salju {
          position: absolute;
          border-radius: 9999px;
          background: #ffffff;
          animation-name: lp-turun;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
        }

        /* ===== Suasana siang / malam di panel kiri ===== */
        /* langit malam menimpa langit siang dengan perlahan */
        .lp-malam {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, #0b1026 0%, #141b3d 50%, #1e1b4b 100%);
          opacity: 0;
          transition: opacity 1.1s ease;
          pointer-events: none;
        }
        .dark .lp-malam { opacity: 1; }

        /* matahari dan bulan bergantian naik-turun */
        .lp-benda {
          position: absolute;
          pointer-events: none;
          transition: transform 1.3s cubic-bezier(0.65, 0, 0.35, 1), opacity 1s ease;
        }
        .lp-benda-siang { top: 2.5rem; right: 5rem; width: 8rem; height: 8rem; }
        .dark .lp-benda-siang { transform: translateY(240%) scale(0.6); opacity: 0; }
        .lp-benda-malam {
          top: 3.5rem; right: 7rem; width: 6rem; height: 6rem;
          transform: translateY(-300%) scale(0.7); opacity: 0;
        }
        .dark .lp-benda-malam { transform: translateY(0) scale(1); opacity: 1; }

        @keyframes lp-putar { to { transform: rotate(360deg); } }
        .lp-sinar {
          position: absolute;
          inset: -2.5rem;
          border-radius: 9999px;
          background: repeating-conic-gradient(from 0deg, rgba(255, 238, 160, 0.6) 0deg 6deg, transparent 6deg 20deg);
          -webkit-mask-image: radial-gradient(closest-side, transparent 58%, #000 64%, transparent 100%);
          mask-image: radial-gradient(closest-side, transparent 58%, #000 64%, transparent 100%);
          animation: lp-putar 70s linear infinite;
        }
        .lp-matahari {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: radial-gradient(circle at 35% 35%, #fffbd0 0%, #ffd84a 45%, #ffb020 100%);
          box-shadow: 0 0 40px 14px rgba(255, 214, 80, 0.55), 0 0 110px 40px rgba(255, 200, 60, 0.3);
        }

        .lp-halo-bulan {
          position: absolute;
          inset: -3rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(200, 210, 255, 0.22) 0%, transparent 65%);
        }
        .lp-bulan {
          position: absolute;
          top: 0.4rem;
          left: 1.6rem;
          width: 4.6rem;
          height: 4.6rem;
          border-radius: 9999px;
          /* sabit bulan: bayangan yang digeser membentuk bulan sabit */
          box-shadow: -1rem 0.55rem 0 0 #fef3c7;
          filter: drop-shadow(0 0 12px rgba(254, 243, 199, 0.6)) drop-shadow(0 0 36px rgba(170, 180, 255, 0.35));
        }

        /* bintang berkedip, hanya terlihat saat malam */
        .lp-langit-bintang {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease;
          pointer-events: none;
        }
        .dark .lp-langit-bintang { opacity: 1; }
        @keyframes lp-kedip {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.15); }
        }
        .lp-bintang {
          position: absolute;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.8);
          animation: lp-kedip ease-in-out infinite;
        }

        /* bintang jatuh sesekali */
        @keyframes lp-meteor {
          0%   { opacity: 0; transform: translate(0, 0) rotate(35deg); }
          2%   { opacity: 1; }
          9%   { opacity: 0; transform: translate(320px, 224px) rotate(35deg); }
          100% { opacity: 0; transform: translate(320px, 224px) rotate(35deg); }
        }
        .lp-meteor {
          position: absolute;
          width: 110px;
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0), #ffffff);
          opacity: 0;
          animation: lp-meteor 8s ease-in infinite;
        }

        /* awan: dua lapis (siang & malam) saling memudar, dan hanyut pelan */
        .lp-awan-siang, .lp-awan-malam {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: opacity 1.1s ease;
        }
        .lp-awan-siang { filter: drop-shadow(0 7px 10px rgba(20, 60, 160, 0.22)); }
        .lp-awan-malam { opacity: 0; filter: drop-shadow(0 0 12px rgba(150, 160, 255, 0.18)); }
        .dark .lp-awan-siang { opacity: 0; }
        .dark .lp-awan-malam { opacity: 1; }

        @keyframes lp-hanyut {
          from { transform: translateX(calc(var(--hanyut, 40px) * -1)); }
          to   { transform: translateX(var(--hanyut, 40px)); }
        }
        .lp-hanyut { animation: lp-hanyut 40s ease-in-out infinite alternate; }

        /* ===== Panel kanan & latar saat mode gelap ===== */
        .lp-root, .lp-kanan { transition: background-color 0.5s ease, color 0.5s ease; }
        .dark .lp-root { background: #0b1220 !important; color-scheme: dark; }
        .dark .lp-kanan { background: #0b1220 !important; color: #e5e7eb; }
        .dark .lp-kanan .text-gray-500 { color: #94a3b8 !important; }
        .dark .lp-kanan .text-gray-400 { color: #7c8aa5 !important; }
        .dark .lp-kanan .text-blue-400 { color: #60a5fa !important; }
        .dark .lp-kanan .text-blue-600 { color: #60a5fa !important; }
        .dark .lp-kanan .lp-field { background: #172033 !important; border-color: #2b3a52 !important; }
        .dark .lp-kanan .lp-field:focus-within { background: #1e2a42 !important; }
        .dark .lp-kanan input, .dark .lp-kanan select { color: #e5e7eb; }
        .dark .lp-kanan input::placeholder { color: #6b7a94; }
        .dark .lp-kanan select option { background: #172033; color: #e5e7eb; }
        .dark .lp-kanan input:-webkit-autofill {
          -webkit-text-fill-color: #e5e7eb;
          box-shadow: 0 0 0 1000px #172033 inset;
        }

        /* tombol mode gelap/terang */
        .lp-tema-btn { background: #ffffff; color: #1e3a8a; border: 1px solid #dbeafe; }
        .lp-tema-ikon { background: #eff6ff; color: #2563eb; }
        .dark .lp-tema-btn { background: #172033; color: #e5e7eb; border-color: #2b3a52; }
        .dark .lp-tema-ikon { background: #243352; color: #fcd34d; }

        @media (prefers-reduced-motion: reduce) {
          .lp-salju { animation: none; opacity: 0.35; }
          .lp-bentuk, .lp-hanyut { animation: none; }
          .lp-mobil-masuk, .lp-mobil, .lp-jalan { animation: none; }
          .lp-angin { display: none; }
          .lp-sinar, .lp-bintang { animation: none; }
          .lp-meteor { display: none; }
          .lp-benda, .lp-malam, .lp-langit-bintang { transition: none; }
        }
      `}</style>

      {/* Tombol mode gelap/terang (sama dengan yang ada di dashboard) */}
      <button
        type="button"
        onClick={toggleTema}
        className="lp-tema-btn fixed top-4 right-4 z-30 flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-sm font-medium shadow-md active:scale-95 transition"
        aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      >
        <span className="lp-tema-ikon w-8 h-8 rounded-full flex items-center justify-center">
          {gelap ? <FaSun /> : <FaMoon />}
        </span>
        {gelap ? "Mode Terang" : "Mode Gelap"}
      </button>

      {/* Kiri */}
      <div
        className="hidden md:flex w-2/3 text-white flex-col justify-center items-center relative overflow-hidden py-10 rounded-r-[4rem]"
        style={{ background: "linear-gradient(160deg, #4aa8ff 0%, #2f7bf5 55%, #2563eb 100%)" }}
      >

        {/* langit malam (muncul perlahan saat mode gelap) */}
        <div className="lp-malam" />

        {/* bintang + bintang jatuh (malam) */}
        <div className="lp-langit-bintang">
          {BINTANG.map((b) => (
            <span
              key={b.id}
              className="lp-bintang"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: b.size,
                height: b.size,
                animationDuration: `${b.durasi}s`,
                animationDelay: `-${b.tunda}s`,
              }}
            />
          ))}
          <span className="lp-meteor" style={{ top: "8%", left: "18%", animationDelay: "1s" }} />
          <span className="lp-meteor" style={{ top: "22%", left: "48%", animationDelay: "4.5s" }} />
        </div>

        {/* matahari (siang) */}
        <div className="lp-benda lp-benda-siang">
          <div className="lp-sinar" />
          <div className="lp-matahari" />
        </div>

        {/* bulan sabit (malam) */}
        <div className="lp-benda lp-benda-malam">
          <div className="lp-halo-bulan" />
          <div className="lp-bulan" />
        </div>

        {/* cahaya lembut di belakang */}
        <div className="absolute w-96 h-96 bg-white rounded-full blur-[150px] opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-300 rounded-full blur-[130px] opacity-30" />

        {/* awan hiasan (satu awan lewat di depan matahari / bulan) */}
        <DefAwan />
        <Awan className="top-16 left-[5rem]" lebar={12} hanyut={50} detik={46} />
        <Awan className="top-[7rem] right-[9rem]" lebar={9} lambat hanyut={70} detik={55} />
        <Awan className="top-[40%] left-[5%]" lebar={6.5} hanyut={30} detik={38} opasitas={0.75} />
        <Awan className="bottom-24 left-[4.5rem]" lebar={10} lambat hanyut={45} detik={50} />
        <Awan className="bottom-40 right-6" lebar={11} hanyut={55} detik={44} />

        {/* titik-titik cahaya melayang turun */}
        <div className="absolute inset-0">
          {SALJU.map((s) => (
            <span
              key={s.id}
              className="lp-salju"
              style={{
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                opacity: s.opasitas,
                animationDuration: `${s.durasi}s`,
                animationDelay: `-${s.tunda}s`,
              }}
            />
          ))}
        </div>

        {/* blok konten: logo + judul menempel rapat, ditengah secara keseluruhan */}
        <div className="flex flex-col items-center z-10 max-h-[85vh] justify-center gap-2">
          {/* tim di dalam mobil: masuk dari kiri, lalu terus "melaju" di tempat */}
          <div className="lp-mobil-masuk flex flex-col items-center mb-3">
            <div className="relative">
              <span className="lp-angin -right-6 bottom-[32%] w-8" style={{ animationDelay: "0s" }} />
              <span className="lp-angin -right-9 bottom-[22%] w-10" style={{ animationDelay: "0.27s" }} />
              <span className="lp-angin -right-5 bottom-[12%] w-6" style={{ animationDelay: "0.53s" }} />

              <img
                src={mobilTim}
                alt="Tim Bidang AKLAP berkendara bersama"
                className="lp-mobil h-[22vh] min-h-[120px] w-auto object-contain drop-shadow-xl"
              />
            </div>

            <div className="lp-jalan h-1 w-80 rounded-full mt-1" />
          </div>

          <div className="bg-white rounded-3xl px-10 py-6 shadow-xl shadow-blue-900/20">
            <img
              src={logo}
              alt="Logo"
              className="w-[26rem] max-h-[46vh] object-contain"
            />
          </div>

          <h1 className="text-5xl font-bold text-center leading-tight mt-2">
            Arsip Dokumen
          </h1>

          <p className="text-2xl text-blue-50 text-center px-10">
            Bidang Akuntansi Pelaporan dan SIKD
          </p>

          <p className="text-blue-100">
            Badan Keuangan Dan Aset Daerah Kabupaten Seruyan
          </p>
        </div>

      </div>

      {/* Kanan */}
      <div className="lp-kanan w-full md:w-1/3 flex items-center justify-center bg-white">

        <div className="w-full max-w-md p-8">

          <h2 className="text-3xl font-bold mb-2">
            Login
          </h2>

          <p className="text-gray-500 mb-8">
            Silakan masuk menggunakan akun Anda
          </p>

          <form onSubmit={handleLogin}>

            <div className="mb-4">
              <label className="block text-sm mb-2 font-medium">
                Email
              </label>

              <div className="lp-field flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                <FaEnvelope className="text-blue-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm mb-2 font-medium">
                Password
              </label>

              <div className="lp-field flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                <FaLock className="text-blue-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="6 karakter atau lebih"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-right mb-4">
              <button
                type="button"
                onClick={handleLupaPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Lupa password?
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2 font-medium">
                Tahun Anggaran
              </label>

              <div className="lp-field flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                <FaCalendarAlt className="text-blue-400 shrink-0" />

                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none appearance-none cursor-pointer"
                >
                  {daftarTahun.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <FaChevronDown className="text-gray-400 text-sm shrink-0 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-3 rounded-lg font-semibold transition"
            >
              {loading ? "Memproses..." : "Login"}
            </button>

          </form>

          <div className="mt-10 text-center text-sm text-gray-400">
            Arsip Dokumen v1.0
          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;