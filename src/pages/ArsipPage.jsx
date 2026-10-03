import { useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DocumentContext } from "../context/DocumentContext";
import { FaFileAlt, FaChevronDown, FaSearch } from "react-icons/fa";

const ADMIN_UID = "By09HK5iw3dS8yBZ1OmMotw1TJC3";

const JENIS_SURAT = [
  "Semua",
  "Surat Masuk",
  "Surat Keluar",
  "Nota Dinas",
  "Surat Keputusan",
  "SPJ Perdin",
  "SPJ Makan-Minum",
  "SPJ Honorarium",
  "Surat Pengantar",
  "Surat Cuti",
  "Dokumen Lainnya"
];

const JENIS_FILE = ["Semua", "PDF", "Word", "Excel"];

function ArsipPage() {

  const { documents, deleteDocument } = useContext(DocumentContext);
  const [keyword, setKeyword] = useState("");
  const [filterSurat, setFilterSurat] = useState("Semua");
  const [filterFile, setFilterFile] = useState("Semua");
  const [previewFile, setPreviewFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek apakah user yang login adalah admin
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setIsAdmin(user?.uid === ADMIN_UID);
    });
    return () => unsub();
  }, []);

  // Tutup preview dengan tombol Esc
  useEffect(() => {
    if (!previewFile) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewFile(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewFile]);

  const handleHapus = async (doc) => {
    if (!window.confirm(`Hapus dokumen "${doc.nama}" dari daftar arsip?`)) return;
    try {
      await deleteDocument(doc.id);
    } catch (error) {
      alert("Gagal menghapus dokumen: " + error.message);
    }
  };

  const dokumenTersaring = documents.filter((doc) => {
    const cocokNama = (doc.nama || "").toLowerCase().includes(keyword.toLowerCase());
    const cocokSurat = filterSurat === "Semua" || doc.kategori === filterSurat;
    const cocokFile = filterFile === "Semua" || doc.tipeFile === filterFile;
    return cocokNama && cocokSurat && cocokFile;
  });

  // Google Drive bisa menampilkan pratinjau PDF, Word, maupun Excel
  const bisaPreview = (doc) => Boolean(doc.previewUrl || doc.fileUrl);

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

      {/* Cari, Filter Jenis Surat & Jenis File */}
      <div className="bg-white rounded-2xl shadow p-4 mb-5 space-y-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Cari Dokumen
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Filter Jenis Surat
            </label>

            <div className="relative flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
              <FaFileAlt className="text-blue-400 shrink-0" />

              <select
                value={filterSurat}
                onChange={(e) => setFilterSurat(e.target.value)}
                className="w-full bg-transparent p-3 outline-none appearance-none cursor-pointer"
              >
                {JENIS_SURAT.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>

              <FaChevronDown className="text-gray-400 text-sm shrink-0 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Filter Jenis File
            </label>

            <div className="relative flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
              <FaFileAlt className="text-blue-400 shrink-0" />

              <select
                value={filterFile}
                onChange={(e) => setFilterFile(e.target.value)}
                className="w-full bg-transparent p-3 outline-none appearance-none cursor-pointer"
              >
                {JENIS_FILE.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>

              <FaChevronDown className="text-gray-400 text-sm shrink-0 pointer-events-none" />
            </div>
          </div>

          <span className="text-sm text-gray-400 sm:self-end sm:pb-3 whitespace-nowrap">
            Menampilkan {dokumenTersaring.length} dokumen
          </span>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">
                Nama Dokumen
              </th>

              <th className="text-left p-3">
                Kategori
              </th>

              <th className="text-left p-3">
                Jenis File
              </th>

              <th className="text-left p-3">
                Tanggal
              </th>

              <th className="text-left p-3">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>

            {dokumenTersaring.map((doc) => (

              <tr
                key={doc.id}
                className="border-b"
              >

                <td className="p-3">
                  {doc.nama}
                </td>

                <td className="p-3">
                  {doc.kategori}
                </td>

                <td className="p-3">
                  {doc.tipeFile || "-"}
                </td>

                <td className="p-3">
                  {doc.tanggal}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">

                    {bisaPreview(doc) && (
                      <button
                        onClick={() => setPreviewFile(doc.previewUrl || doc.fileUrl)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        Preview
                      </button>
                    )}

                    <a
                      href={doc.fileUrl}
                      download={doc.nama}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm text-center transition"
                    >
                      Download
                    </a>

                    {isAdmin && (
                      <button
                        onClick={() => handleHapus(doc)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                      >
                        Hapus
                      </button>
                    )}

                  </div>
                </td>

              </tr>

            ))}

            {dokumenTersaring.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Dokumen tidak ditemukan
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* Modal Preview */}
      {previewFile && (

        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2 sm:p-4"
          onClick={() => setPreviewFile(null)}
        >

          <div
            className="bg-white w-full max-w-6xl h-full max-h-[90dvh] rounded-xl overflow-hidden shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between items-center p-3 sm:p-4 border-b shrink-0">

              <h2 className="font-bold text-lg">
                Preview Dokumen
              </h2>

              <button
                onClick={() => setPreviewFile(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Tutup
              </button>

            </div>

            <iframe
              src={previewFile}
              title="Preview Dokumen"
              className="w-full flex-1 min-h-0"
            />

          </div>

        </div>

      )}

    </div>
  );
}

export default ArsipPage;