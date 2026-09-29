import { useState, useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  FaUser,
  FaIdBadge,
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCamera,
} from "react-icons/fa";

function Input({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
      <Icon className="text-blue-400 shrink-0" />
      <input
        {...props}
        className="w-full bg-transparent p-3 outline-none disabled:text-gray-400"
      />
    </div>
  );
}

// ukuran maksimal foto yang boleh dipilih, supaya tidak terlalu berat
const MAKS_UKURAN_FOTO = 2 * 1024 * 1024; // 2 MB

// Kecilkan & padatkan gambar di browser, hasilnya string base64 (data URL).
// Foto disimpan langsung di Firestore, jadi tidak perlu Firebase Storage (Blaze).
const kompresGambar = (file, ukuranMaks = 256, kualitas = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const skala = Math.min(ukuranMaks / img.width, ukuranMaks / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * skala);
        canvas.height = Math.round(img.height * skala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", kualitas)); // biasanya 10-40 KB
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    bidang: "",
  });

  const [fotoURL, setFotoURL] = useState(""); // foto tersimpan (base64 dari Firestore)
  const [fotoBaru, setFotoBaru] = useState(""); // foto baru yang sudah dikompres, belum disimpan

  // ambil data profil milik akun yang sedang login (bukan akun tetap "admin")
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const refDoc = doc(db, "users", currentUser.uid);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          setForm({
            nama: data.nama || "",
            nip: data.nip || "",
            jabatan: data.jabatan || "",
            bidang: data.bidang || "",
          });
          setFotoURL(data.foto || "");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePilihFoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // supaya bisa memilih file yang sama lagi
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, dsb)");
      return;
    }

    if (file.size > MAKS_UKURAN_FOTO) {
      alert("Ukuran foto maksimal 2 MB");
      return;
    }

    try {
      const hasil = await kompresGambar(file);
      setFotoBaru(hasil);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses foto, coba gambar lain");
    }
  };

  const handleSimpanProfil = async (e) => {
    e.preventDefault();
    if (!user) return;

    setMenyimpan(true);
    try {
      const fotoFinal = fotoBaru || fotoURL;

      await setDoc(
        doc(db, "users", user.uid),
        { ...form, email: user.email, foto: fotoFinal },
        { merge: true }
      );

      setFotoURL(fotoFinal);
      setFotoBaru("");
      alert("Profil berhasil disimpan");
    } catch (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setMenyimpan(false);
    }
  };

  // ===== Ganti Password =====
  const [passwordSaatIni, setPasswordSaatIni] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [gantiPasswordLoading, setGantiPasswordLoading] = useState(false);

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (passwordBaru.length < 6) {
      alert("Password baru minimal 6 karakter");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      alert("Konfirmasi password baru tidak cocok");
      return;
    }

    setGantiPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordSaatIni);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordBaru);

      alert("Password berhasil diubah");
      setPasswordSaatIni("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        alert("Password saat ini yang kamu masukkan salah");
      } else {
        alert("Gagal mengubah password: " + error.message);
      }
    } finally {
      setGantiPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <p className="mt-6 text-gray-400">Memuat profil...</p>
      </div>
    );
  }

  const fotoDitampilkan = fotoBaru || fotoURL;

  return (
    <div>
      <Header />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Informasi Profil */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h1 className="text-2xl font-bold mb-1">
            Profil Pengguna
          </h1>

          <p className="text-gray-500 mb-6 text-sm">
            Data ini akan tampil di sidebar aplikasi
          </p>

          {/* Foto Profil */}
          <div className="flex items-center gap-4 mb-6">

            <div className="relative">
              {fotoDitampilkan ? (
                <img
                  src={fotoDitampilkan}
                  alt="Foto profil"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                  {(form.nama || user?.email || "?").charAt(0).toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow transition"
                aria-label="Ganti foto profil"
              >
                <FaCamera size={13} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePilihFoto}
                className="hidden"
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>Klik ikon kamera untuk mengganti foto.</p>
              <p>Format gambar, maksimal 2 MB.</p>
            </div>

          </div>

          <form onSubmit={handleSimpanProfil} className="space-y-4">

            <Input
              icon={FaEnvelope}
              type="email"
              value={user?.email || ""}
              disabled
            />

            <Input
              icon={FaUser}
              type="text"
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={handleChange("nama")}
            />

            <Input
              icon={FaIdBadge}
              type="text"
              placeholder="NIP"
              value={form.nip}
              onChange={handleChange("nip")}
            />

            <Input
              icon={FaBriefcase}
              type="text"
              placeholder="Jabatan"
              value={form.jabatan}
              onChange={handleChange("jabatan")}
            />

            <Input
              icon={FaBuilding}
              type="text"
              placeholder="Bidang"
              value={form.bidang}
              onChange={handleChange("bidang")}
            />

            <button
              type="submit"
              disabled={menyimpan}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-semibold transition"
            >
              {menyimpan ? "Menyimpan..." : "Simpan Profil"}
            </button>

          </form>

        </div>

        {/* Ganti Password */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h2 className="text-2xl font-bold mb-1">
            Ganti Password
          </h2>

          <p className="text-gray-500 mb-6 text-sm">
            Masukkan password lama untuk konfirmasi
          </p>

          <form onSubmit={handleGantiPassword} className="space-y-4">

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
              <FaLock className="text-blue-400 shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password saat ini"
                value={passwordSaatIni}
                onChange={(e) => setPasswordSaatIni(e.target.value)}
                className="w-full bg-transparent p-3 outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
              <FaLock className="text-blue-400 shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password baru (min. 6 karakter)"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                className="w-full bg-transparent p-3 outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
              <FaLock className="text-blue-400 shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                className="w-full bg-transparent p-3 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={gantiPasswordLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg font-semibold transition"
            >
              {gantiPasswordLoading ? "Menyimpan..." : "Simpan Password"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default ProfilePage;