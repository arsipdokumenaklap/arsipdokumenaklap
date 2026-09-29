import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// taruh file logo di src/assets/logo.png lalu import seperti ini,
// supaya alamatnya otomatis benar walau situs dipindah ke subfolder
import logo from "../assets/logo.png";


// posisi, ukuran, kecepatan tiap titik salju — dibuat sekali saja, bukan tiap render
const SALJU = Array.from({ length: 22 }).map((_, i) => {
  const acak = (min, max) => min + Math.random() * (max - min);
  return {
    id: i,
    left: acak(0, 100),
    size: acak(3, 8),
    durasi: acak(10, 22),
    tunda: acak(0, 22),
    opasitas: acak(0.15, 0.6),
  };
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    <div className="min-h-screen flex">
      <style>{`
        @keyframes lp-apung {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes lp-putar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lp-bentuk { animation: lp-apung 6s ease-in-out infinite; }
        .lp-bentuk.lambat { animation-duration: 9s; }
        .lp-belah { animation: lp-putar 14s linear infinite; }

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

        @media (prefers-reduced-motion: reduce) {
          .lp-salju { animation: none; opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-bentuk, .lp-belah { animation: none; }
        }
      `}</style>

      {/* Kiri */}
      <div className="hidden md:flex w-2/3 bg-slate-950 text-white flex-col justify-center items-center relative overflow-hidden py-10">

        {/* cahaya lembut di belakang */}
        <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-400 rounded-full blur-[130px] opacity-10" />


        {/* titik-titik salju melayang turun */}
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
          <div className="bg-white/90 rounded-3xl px-10 py-6 shadow-[0_0_60px_rgba(255,255,255,0.15)]">
            <img
              src={logo}
              alt="Logo"
              className="w-[26rem] max-h-[46vh] object-contain"
            />
          </div>

          <h1 className="text-5xl font-bold text-center leading-tight">
            Arsip Dokumen
          </h1>

          <p className="text-2xl text-gray-300 text-center px-10">
            Bidang Akuntansi Pelaporan dan SIKD
          </p>

          <p className="text-gray-400">
            Badan Keuangan Daerah
          </p>
        </div>

      </div>

      {/* Kanan */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-white">

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

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
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

            <div className="mb-6">
              <label className="block text-sm mb-2 font-medium">
                Password
              </label>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
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