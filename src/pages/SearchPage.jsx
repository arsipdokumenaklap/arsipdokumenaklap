import Header from "../components/layout/Header";
import { FaSearch, FaFilePdf } from "react-icons/fa";
import { useContext, useState } from "react";
import { DocumentContext } from "../context/DocumentContext";

function SearchPage() {
  const { documents } = useContext(DocumentContext);

  const [keyword, setKeyword] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  const hasilCari = documents.filter((doc) =>
    doc.nama.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <Header />

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          Pencarian Dokumen
        </h1>

        <p className="text-gray-500">
          Cari dokumen berdasarkan nama dokumen
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-2xl shadow mt-6">

        <div className="relative">

          <FaSearch className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Cari dokumen..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border rounded-xl pl-12 p-3"
          />

        </div>

      </div>

      {/* Result */}
      <div className="bg-white p-6 rounded-2xl shadow mt-6">

        <h2 className="text-xl font-bold mb-4">
          Hasil Pencarian
        </h2>

        <div className="space-y-4">

          {hasilCari.length > 0 ? (

            hasilCari.map((doc) => (

              <div
                key={doc.id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
              >

                <div className="flex gap-4 items-center">

                  <FaFilePdf
                    className="text-red-500"
                    size={30}
                  />

                  <div>

                    <h3 className="font-semibold">
                      {doc.nama}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {doc.tanggal}
                    </p>

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                  <button
                    onClick={() => setPreviewFile(doc.fileUrl)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Preview
                  </button>

                  <a
                    href={doc.fileUrl}
                    download={doc.nama}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Download
                  </a>

                </div>

              </div>

            ))

          ) : (

            <p className="text-gray-500">
              Dokumen tidak ditemukan
            </p>

          )}

        </div>

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
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
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

export default SearchPage;