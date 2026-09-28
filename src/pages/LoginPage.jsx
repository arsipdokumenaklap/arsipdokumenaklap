import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Kiri */}
      <div className="hidden md:flex w-2/3 bg-slate-950 text-white flex-col justify-center items-center relative overflow-hidden">

        <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20"></div>

        <img
          src="/logo.png"
          alt="Logo"
          className="w-40 mb-8 z-10"
        />

        <h1 className="text-5xl font-bold text-center z-10">
          Arsip Dokumen
        </h1>

        <p className="text-2xl text-gray-300 mt-4 z-10">
          Bidang Akuntansi Pelaporan dan SIKD
        </p>

        <p className="text-gray-400 mt-2 z-10">
          Badan Keuangan Daerah
        </p>

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

              <input
                type="email"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
            >
              Login
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