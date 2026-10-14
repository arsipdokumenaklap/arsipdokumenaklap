import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaHome,
  FaUpload,
  FaFolderOpen,
  FaChartBar,
  FaBars,
  FaCalendarAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import { useState, useEffect, useRef, useContext } from "react";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ArsipPage from "./pages/ArsipPage";
import LaporanPage from "./pages/LaporanPage";
import ViewDocumentPage from "./pages/ViewDocumentPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadPanel from "./components/UploadPanel";
import { UploadProvider, UploadContext } from "./context/UploadContext";
import { TahunContext } from "./context/TahunContext";

import logo from "./assets/logo.png";

import { db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "./firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";

// berapa menit tanpa aktivitas sebelum otomatis logout
const BATAS_DIAM_MENIT = 30;

function Layout() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);

  // mode gelap/terang: pilihan disimpan di browser, class "dark" dipasang di <html>
  const [gelap, setGelap] = useState(() => {
    try {
      return localStorage.getItem("tema") === "gelap";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", gelap);
    try {
      localStorage.setItem("tema", gelap ? "gelap" : "terang");
    } catch {
      /* penyimpanan browser tidak tersedia, abaikan */
    }
  }, [gelap]);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // tahun anggaran yang sedang dipakai (dipilih saat login)
  const { tahun } = useContext(TahunContext);

  // status upload di latar belakang, dipakai agar logout otomatis tidak memutus upload
  const { adaUploadBerjalan } = useContext(UploadContext);
  const adaUploadRef = useRef(false);
  adaUploadRef.current = adaUploadBerjalan;

  useEffect(() => {
    let lepasListenerProfil = () => {};

    const lepasAuth = onAuthStateChanged(auth, (currentUser) => {
      // hentikan listener profil akun sebelumnya (kalau ada) setiap kali status login berubah
      lepasListenerProfil();

      if (!currentUser) {
        setUserData(null);
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);

      // onSnapshot = mendengarkan perubahan data secara langsung,
      // jadi begitu profil disimpan di halaman Profil, sidebar ikut
      // berubah otomatis tanpa perlu refresh halaman
      lepasListenerProfil = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            // belum pernah mengisi profil, tampilkan email saja sebagai cadangan
            setUserData({ nama: currentUser.email, nip: "", belumAda: true });
          }
        },
        (error) => {
          console.log(error);
          // gagal membaca profil (misal koneksi): jangan paksa ke halaman Profil
          setUserData({ nama: currentUser.email, nip: "", gagalBaca: true });
        }
      );
    });

    return () => {
      lepasListenerProfil();
      lepasAuth();
    };
  }, []);

  // profil dianggap lengkap kalau nama, NIP, dan jabatan sudah terisi.
  // null = data profil belum selesai dimuat (jangan buru-buru mengalihkan)
  const profilLengkap = !userData
    ? null
    : userData.gagalBaca
    ? true
    : !userData.belumAda &&
      !!String(userData.nama || "").trim() &&
      !!String(userData.nip || "").trim() &&
      !!String(userData.jabatan || "").trim();

  // profil belum lengkap: paksa ke halaman Profil sampai selesai diisi
  useEffect(() => {
    if (
      profilLengkap === false &&
      location.pathname !== "/profile" &&
      location.pathname !== "/"
    ) {
      navigate("/profile", { replace: true });
    }
  }, [profilLengkap, location.pathname, navigate]);

  // tutup dropdown profil saat klik di luar kotaknya
  useEffect(() => {
    const handleClickLuar = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickLuar);
    return () => document.removeEventListener("mousedown", handleClickLuar);
  }, []);

  // tutup dropdown profil dan sidebar HP otomatis setiap pindah halaman
  useEffect(() => {
    setShowProfile(false);
    setOpen(false);
  }, [location.pathname]);

  // logout otomatis kalau aplikasi ditinggalkan tanpa aktivitas
  useEffect(() => {
    let terakhirAktif = Date.now();
    const catatAktivitas = () => {
      terakhirAktif = Date.now();
    };

    const daftarEvent = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    daftarEvent.forEach((e) =>
      window.addEventListener(e, catatAktivitas, { passive: true })
    );

    const cekDiam = async () => {
      // hanya berlaku kalau sedang login
      if (!auth.currentUser) return;

      // upload masih berjalan: jangan logout, hitung ulang waktu diam
      if (adaUploadRef.current) {
        terakhirAktif = Date.now();
        return;
      }

      const lamaDiam = Date.now() - terakhirAktif;
      if (lamaDiam >= BATAS_DIAM_MENIT * 60 * 1000) {
        try {
          await signOut(auth);
        } catch (error) {
          console.log(error);
        }
        localStorage.removeItem("isLogin");
        navigate("/");
        alert(
          `Anda otomatis keluar karena tidak ada aktivitas selama ${BATAS_DIAM_MENIT} menit. Silakan login kembali.`
        );
      }
    };

    // dicek tiap 30 detik; browser kadang menahan timer di tab yang tidak aktif,
    // jadi dicek juga saat tab dibuka kembali
    const interval = setInterval(cekDiam, 30 * 1000);
    const saatTabKembali = () => {
      if (document.visibilityState === "visible") cekDiam();
    };
    document.addEventListener("visibilitychange", saatTabKembali);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", saatTabKembali);
      daftarEvent.forEach((e) => window.removeEventListener(e, catatAktivitas));
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
    localStorage.removeItem("isLogin");
    navigate("/");
  };

  const menuClass = ({ isActive }) =>
    `p-3 rounded-lg flex items-center gap-3 transition-all duration-200 active:scale-95 ${
      profilLengkap === false ? "opacity-50 " : ""
    }${
      isActive
        ? "bg-white text-blue-700 font-semibold shadow-lg"
        : "hover:bg-white/15 hover:translate-x-1"
    }`;

  // halaman login tampil sendiri, tanpa sidebar dan tanpa margin
  if (location.pathname === "/") {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="h-[100dvh] bg-gray-100 overflow-hidden flex">

      {/* Bar atas khusus HP: tombol menu tidak lagi menimpa isi halaman */}
      <div className="topbar-app md:hidden fixed top-0 inset-x-0 h-14 z-30 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center gap-3 px-4 shadow-md">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 active:scale-95 transition"
          aria-label="Buka menu"
        >
          <FaBars size={20} />
        </button>

        <span className="font-bold text-lg">
          Arsip Dokumen
        </span>

        <span className="ml-auto text-sm text-blue-50 font-medium">
          TA {tahun}
        </span>

        <button
          onClick={() => setGelap((g) => !g)}
          className="p-2 rounded-lg hover:bg-white/15 active:scale-95 transition"
          aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        >
          {gelap ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          sidebar-app fixed top-0 left-0 z-50
          w-64 h-[100dvh] overflow-y-auto
          bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo dengan latar terang samar supaya tulisan logo terlihat */}
        <div className="mb-5 bg-white/90 rounded-2xl p-3 shadow-lg">
          <img
            src={logo}
            alt="Logo AKLAP SIKD"
            className="w-full"
          />
        </div>

        {/* Tahun anggaran sesuai pilihan saat login (hanya tampilan, tidak bisa diganti) */}
        <div className="mb-6 flex items-center gap-3 bg-white/15 border border-white/25 rounded-lg px-3 py-2.5">
          <FaCalendarAlt className="text-white shrink-0" />

          <div className="leading-tight">
            <p className="text-xs text-blue-100">
              Tahun Anggaran
            </p>

            <p className="font-bold text-lg">
              {tahun}
            </p>
          </div>
        </div>

        <div className="space-y-4 flex-1">

          <NavLink to="/dashboard" className={menuClass}>
            <FaHome />
            Dashboard
          </NavLink>

          <NavLink to="/upload" className={menuClass}>
            <FaUpload />
            Upload Dokumen
          </NavLink>

          <NavLink to="/arsip" className={menuClass}>
            <FaFolderOpen />
            Arsip
          </NavLink>

          <NavLink to="/laporan" className={menuClass}>
            <FaChartBar />
            Laporan
          </NavLink>

        </div>

        {/* Tombol mode gelap/terang */}
        <button
          onClick={() => setGelap((g) => !g)}
          className="mt-4 mb-2 w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200"
        >
          {gelap ? <FaSun /> : <FaMoon />}
          <span className="text-sm font-medium">
            {gelap ? "Mode Terang" : "Mode Gelap"}
          </span>
        </button>

        {/* Profil User */}
        <div ref={profileRef} className="mt-auto pt-6 border-t border-white/25 relative">

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/15"
          >
            <img
              src={
                userData?.foto ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.nama || "U")}&background=2563eb&color=fff`
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="text-left min-w-0">
              <p className="font-semibold text-sm">
                {userData?.nama || "Loading..."}
              </p>

              {/* spasi di dalam NIP dibuat tidak bisa putus baris, supaya angkanya tidak turun */}
              <p className="text-[11px] tracking-tight text-blue-100 whitespace-nowrap">
                NIP. {(userData?.nip || "-").replace(/\s+/g, "\u00A0")}
              </p>
            </div>
          </button>

          <div
            className={`absolute bottom-16 left-0 w-full bg-white rounded-lg shadow-lg overflow-hidden origin-bottom transition-all duration-200 ease-out ${
              showProfile
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 translate-y-2 pointer-events-none"
            }`}
          >

            <button
              onClick={() => {
                setShowProfile(false);
                navigate("/profile");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700"
            >
              Lengkapi Profil
            </button>

            <button
              onClick={() => {
                setShowProfile(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>

          </div>

        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-64 h-[100dvh] overflow-y-auto p-4 pt-20 md:p-8">

        {/* key berubah setiap pindah halaman, jadi animasi masuk jalan lagi */}
        <div key={location.pathname} className="halaman-masuk">

          {/* Pengingat wajib lengkapi profil */}
          {profilLengkap === false && (
            <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
              <p className="font-semibold">Lengkapi profil Anda terlebih dahulu</p>
              <p className="text-sm">
                Isi Nama Lengkap, NIP, dan Jabatan lalu klik Simpan Profil. Menu lain
                akan terbuka setelah profil lengkap.
              </p>
            </div>
          )}

          <Routes>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/arsip"
              element={
                <ProtectedRoute>
                  <ArsipPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/laporan"
              element={
                <ProtectedRoute>
                  <LaporanPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view/:id"
              element={
                <ProtectedRoute>
                  <ViewDocumentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

          </Routes>

        </div>

      </main>

      {/* Panel progres upload, tampil di semua halaman */}
      <UploadPanel />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <UploadProvider>
        <Layout />
      </UploadProvider>
    </HashRouter>
  );
}

export default App;