import { useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DocumentContext } from "../context/DocumentContext";
import { KonfirmasiContext } from "../context/KonfirmasiContext";
import { FaTrashAlt, FaSearch, FaUndo } from "react-icons/fa";

const ADMIN_UID = "By09HK5iw3dS8yBZ1OmMotw1TJC3";

// "dihapusPada" berupa Timestamp Firestore; sesaat setelah dihapus nilainya masih kosong
function formatWaktu(ts) {
  if (!ts?.toDate) return "Baru saja";
  return ts.toDate().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SampahPage() {
  const { sampah, pulihkan, hapusPermanen } = useContext(DocumentContext);
  const konfirmasi = useContext(KonfirmasiContext);
  const [keyword, setKeyword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  // hanya akun admin yang boleh menghapus permanen
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setIsAdmin(user?.uid === ADMIN_UID);
    });
    return () => unsub();
  }, []);

  const tersaring = sampah.filter((doc) =>
    (doc.nama || "").toLowerCase().includes(keyword.toLowerCase())
  );

  const handlePulihkan = async (doc) => {
    try {
      await pulihkan(doc.id);
    } catch (error) {
      konfirmasi.info("Gagal memulihkan dokumen", error.message, "galat");
    }
  };

  const handleHapusPermanen = async (doc) => {
    const ya = await konfirmasi({
      tipe: "bahaya",
      judul: "Hapus permanen?",
      pesan: "Dokumen akan dihapus selamanya dan tidak bisa dipulihkan lagi.",
      detail: doc.nama,
      tombolYa: "Ya, Hapus Permanen",
    });
    if (!ya) return;
    try {
      await hapusPermanen(doc.id);
    } catch (error) {
      konfirmasi.info("Gagal menghapus dokumen", error.message, "galat");
    }
  };

  const handleKosongkan = async () => {
    if (sampah.length === 0) return;
    const ya = await konfirmasi({
      tipe: "bahaya",
      judul: "Kosongkan Sampah?",
      pesan: `${sampah.length} dokumen akan dihapus permanen dan tidak bisa dipulihkan lagi.`,
      tombolYa: "Ya, Kosongkan",
    });
    if (!ya) return;

    setSibuk(true);
    try {
      await Promise.all(sampah.map((d) => hapusPermanen(d.id)));
    } catch (error) {
      konfirmasi.info("Sebagian dokumen gagal dihapus", error.message, "galat");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div>

      <div className="mb-8">
        <h1 className="anim-slide-kiri text-2xl font-extrabold tracking-tight text-blue-950">
          Sistem Arsip Digital
        </h1>

        <p
          className="anim-slide-kiri text-gray-500 mt-2 text-lg"
          style={{ animationDelay: "120ms" }}
        >
          BIDANG AKUNTANSI PELAPORAN DAN SISTEM INFORMASI KEUANGAN DAERAH
        </p>

        <div
          className="anim-garis h-1 w-20 rounded-full bg-blue-600 mt-4"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Cari + keterangan */}
      <div className="bg-white rounded-2xl shadow p-4 mb-5 space-y-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Cari di Sampah
          </label>

          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
            <FaSearch className="text-blue-400 shrink-0" />

            <input
              type="text"
              placeholder="Cari berdasarkan nama dokumen..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent p-3 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            Dokumen di sini tidak tampil di Arsip dan Dashboard.
            Klik <b>Pulihkan</b> untuk mengembalikannya.
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-gray-400 whitespace-nowrap">
              {tersaring.length} dokumen
            </span>

            {isAdmin && (
              <button
                onClick={handleKosongkan}
                disabled={sibuk || sampah.length === 0}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
              >
                {sibuk ? "Menghapus..." : "Kosongkan Sampah"}
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Nama Dokumen</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Jenis File</th>
              <th className="text-left p-3">Dihapus Pada</th>
              {/* kolom ini hanya tampil untuk akun admin */}
              {isAdmin && <th className="text-left p-3">Dihapus Oleh</th>}
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>

            {tersaring.map((doc) => (
              <tr key={doc.id} className="border-b">

                <td className="p-3">{doc.nama}</td>
                <td className="p-3">{doc.kategori}</td>
                <td className="p-3">{doc.tipeFile || "-"}</td>
                <td className="p-3 whitespace-nowrap">{formatWaktu(doc.dihapusPada)}</td>

                {isAdmin && (
                  <td className="p-3 text-gray-700" title={doc.dihapusOlehEmail || ""}>
                    {doc.dihapusOleh || doc.dihapusOlehEmail || "-"}
                  </td>
                )}

                <td className="p-3">
                  <div className="flex gap-2">

                    <button
                      onClick={() => handlePulihkan(doc)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                    >
                      <FaUndo size={12} />
                      Pulihkan
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleHapusPermanen(doc)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
                      >
                        <FaTrashAlt size={12} />
                        Hapus Permanen
                      </button>
                    )}

                  </div>
                </td>

              </tr>
            ))}

            {tersaring.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="p-6 text-center text-gray-400">
                  {sampah.length === 0 ? "Sampah kosong" : "Dokumen tidak ditemukan"}
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default SampahPage;