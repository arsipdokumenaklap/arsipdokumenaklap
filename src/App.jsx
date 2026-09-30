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
} from "react-icons/fa";

import { useState, useEffect, useRef } from "react";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ArsipPage from "./pages/ArsipPage";
import LaporanPage from "./pages/LaporanPage";
import ViewDocumentPage from "./pages/ViewDocumentPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

import logo from "./assets/logo.png";

import { db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "./firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";

function Layout() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

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
            setUserData({ nama: currentUser.email, nip: "" });
          }
        },
        (error) => {
          console.log(error);
          setUserData({ nama: currentUser.email, nip: "" });
        }
      );
    });

    return () => {
      lepasListenerProfil();
      lepasAuth();
    };
  }, []);

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

  // tutup dropdown profil otomatis setiap pindah halaman
  useEffect(() => {
    setShowProfile(false);
  }, [location.pathname]);

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
      isActive
        ? "bg-blue-600 shadow-lg" 
        : "hover:bg-blue-800 hover:translate-x-1"
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
    <div className="h-screen bg-gray-100 overflow-hidden flex">

      {/* Tombol Mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-blue-950 text-white p-3 rounded-lg"
      >
        <FaBars />
      </button>

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
          fixed top-0 left-0 z-50
          w-64 h-screen
          bg-blue-600 text-white p-5
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo dengan latar terang samar supaya tulisan logo terlihat */}
        <div className="mb-8 bg-white/90 rounded-2xl p-3 shadow-lg">
          <img
            src={logo}
            alt="Logo AKLAP SIKD"
            className="w-full"
          />
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

        {/* Profil User */}
        <div ref={profileRef} className="mt-auto pt-6 border-t border-blue-800 relative">

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-900"
          >
            <img
              src={
                userData?.foto ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.nama || "U")}&background=2563eb&color=fff`
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="text-left">
              <p className="font-semibold text-sm">
                {userData?.nama || "Loading..."}
              </p>

              <p className="text-xs text-gray-300">
                NIP. {userData?.nip || "-"}
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
      <main className="flex-1 md:ml-64 h-screen overflow-y-auto p-4 md:p-8 mt-16 md:mt-0">

        {/* key berubah setiap pindah halaman, jadi animasi masuk jalan lagi */}
        <div key={location.pathname} className="halaman-masuk">

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
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}

export default App;