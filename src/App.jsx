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
  FaSearch,
  FaChartBar,
  FaBars,
} from "react-icons/fa";

import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ArsipPage from "./pages/ArsipPage";
import SearchPage from "./pages/SearchPage";
import LaporanPage from "./pages/LaporanPage";
import ViewDocumentPage from "./pages/ViewDocumentPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Layout() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const docRef = doc(db, "users", "admin");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.log(error);
      }
    };

    getUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    navigate("/");
  };

  const menuClass = ({ isActive }) =>
    isActive
      ? "bg-blue-600 p-3 rounded-lg flex items-center gap-3"
      : "hover:bg-blue-800 p-3 rounded-lg flex items-center gap-3";

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
          bg-blue-950 text-white p-5
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <h1 className="text-2xl font-bold mb-10">
          Arsip Dokumen
        </h1>

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

          <NavLink to="/search" className={menuClass}>
            <FaSearch />
            Pencarian
          </NavLink>

          <NavLink to="/laporan" className={menuClass}>
            <FaChartBar />
            Laporan
          </NavLink>

        </div>

        {/* Profil User */}
        <div className="mt-auto pt-6 border-t border-blue-800 relative">

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-900"
          >
            <img
              src="https://ui-avatars.com/api/?name=JS&background=2563eb&color=fff"
              alt="User"
              className="w-10 h-10 rounded-full"
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

          {showProfile && (
            <div className="absolute bottom-16 left-0 w-full bg-white rounded-lg shadow-lg overflow-hidden">

              <button
                onClick={() => navigate("/profile")}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700"
              >
                Lengkapi Profil
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-64 h-screen overflow-y-auto p-4 md:p-8 mt-16 md:mt-0">

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
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
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