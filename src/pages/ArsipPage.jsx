import Header from "../components/layout/Header";
import { useContext, useState } from "react";
import { DocumentContext } from "../context/DocumentContext";
import { FaFileAlt, FaChevronDown } from "react-icons/fa";

const JENIS_SURAT = ["Semua", "Surat Masuk", "Surat Keluar", "Nota Dinas"];

function ArsipPage() {

  const { documents } = useContext(DocumentContext);
  const [filter, setFilter] = useState("Semua");

  const dokumenTersaring =
    filter === "Semua"
      ? documents
      : documents.filter((doc) => doc.kategori === filter);

  return (
    <div>

      <Header />

      <h1 className="text-3xl font-bold mt-6">
        Arsip Dokumen
      </h1>

      <p className="text-gray-500 mb-6">
        Daftar seluruh dokumen yang telah diupload
      </p>

      {/* Filter Jenis Surat */}
      <div className="bg-white rounded-2xl shadow p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

        <label className="text-sm font-medium shrink-0">
          Filter Jenis Surat
        </label>

        <div className="relative flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 sm:max-w-xs w-full focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
          <FaFileAlt className="text-blue-400 shrink-0" />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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

        <span className="text-sm text-gray-400 sm:ml-auto">
          Menampilkan {dokumenTersaring.length} dokumen
        </span>

      </div>

      <div className="bg-white rounded-2xl shadow p-6">

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
                Tanggal
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
                  {doc.tanggal}
                </td>

              </tr>

            ))}

            {dokumenTersaring.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  Belum ada dokumen untuk jenis surat ini
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ArsipPage;