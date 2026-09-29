
import { useContext, useState } from "react";
import { DocumentContext } from "../context/DocumentContext";
import { FaFileAlt, FaChevronDown, FaSearch } from "react-icons/fa";

const JENIS_SURAT = ["Semua", "Surat Masuk", "Surat Keluar", "Nota Dinas"];
const JENIS_FILE = ["Semua", "PDF", "Word", "Excel"];

function ArsipPage() {

  const { documents } = useContext(DocumentContext);
  const [keyword, setKeyword] = useState("");
  const [filterSurat, setFilterSurat] = useState("Semua");
  const [filterFile, setFilterFile] = useState("Semua");
  const [previewFile, setPreviewFile] = useState(null);

  const dokumenTersaring = documents.filter((doc) => {
    const cocokNama = (doc.nama || "").toLowerCase().includes(keyword.toLowerCase());
    const cocokSurat = filterSurat === "Semua" || doc.kategori === filterSurat;
    const cocokFile = filterFile === "Semua" || doc.tipeFile === filterFile;
    return cocokNama && cocokSurat && cocokFile;
  });

  // preview lewat iframe hanya cocok untuk PDF
  const bisaPreview = (doc) => !doc.tipeFile || doc.tipeFile === "PDF";

  return (
    <div>

     

      <h1 className="text-3xl font-bold mt-6">
        Arsip Dokumen
      </h1>

      <p className="text-gray-500 mb-6">
        Daftar seluruh dokumen yang telah diupload
      </p>

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
                        onClick={() => setPreviewFile(doc.fileUrl)}
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

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl overflow-hidden shadow-lg">

            <div className="flex justify-between items-center p-4 border-b">

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
              title="PDF Preview"
              className="w-full h-[calc(100%-70px)]"
            />

          </div>

        </div>

      )}

    </div>
  );
}

export default ArsipPage;