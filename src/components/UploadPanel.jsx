import { useContext, useState } from "react";
import { UploadContext } from "../context/UploadContext";
import {
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
} from "react-icons/fa";

const LABEL_STATUS = {
  mengupload: "Mengupload ke Drive...",
  menyimpan: "Menyimpan ke arsip...",
  selesai: "Selesai",
  gagal: "Gagal",
};

function formatUkuran(byte) {
  if (!byte) return "";
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadPanel() {
  const { antrian, ulangi, hapusItem, bersihkanSelesai, adaUploadBerjalan } =
    useContext(UploadContext);
  const [kecil, setKecil] = useState(false);

  if (antrian.length === 0) return null;

  const berjalan = antrian.filter(
    (it) => it.status === "mengupload" || it.status === "menyimpan"
  ).length;
  const gagal = antrian.filter((it) => it.status === "gagal").length;
  const selesai = antrian.filter((it) => it.status === "selesai").length;

  let judul;
  if (berjalan > 0) judul = `Mengupload ${berjalan} dokumen...`;
  else if (gagal > 0) judul = `${gagal} upload gagal`;
  else judul = `${selesai} upload selesai`;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <style>{`
        @keyframes up-geser {
          0%   { left: -40%; }
          100% { left: 100%; }
        }
        .up-geser { animation: up-geser 1.2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between bg-blue-950 text-white px-4 py-3">
        <p className="font-semibold text-sm truncate">{judul}</p>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setKecil(!kecil)}
            className="p-2 rounded-lg hover:bg-blue-900 transition"
            aria-label={kecil ? "Perbesar panel" : "Kecilkan panel"}
          >
            {kecil ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>

          {!adaUploadBerjalan && (
            <button
              onClick={bersihkanSelesai}
              className="p-2 rounded-lg hover:bg-blue-900 transition"
              aria-label="Tutup panel"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Daftar */}
      {!kecil && (
        <ul className="max-h-64 overflow-y-auto">
          {antrian.map((it) => {
            const sedangJalan =
              it.status === "mengupload" || it.status === "menyimpan";

            return (
              <li key={it.id} className="px-4 py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">

                  <div className="shrink-0 w-5 flex justify-center">
                    {sedangJalan ? (
                      <span className="block w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    ) : it.status === "selesai" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaExclamationCircle className="text-red-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{it.nama}</p>
                    <p
                      className={`text-xs truncate ${
                        it.status === "gagal" ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {it.status === "gagal"
                        ? it.pesan || "Upload gagal"
                        : `${LABEL_STATUS[it.status]}${
                            it.ukuran ? ` • ${formatUkuran(it.ukuran)}` : ""
                          }`}
                    </p>
                  </div>

                  {it.status === "gagal" && (
                    <button
                      onClick={() => ulangi(it.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Coba lagi"
                    >
                      <FaRedo size={12} />
                    </button>
                  )}

                  {!sedangJalan && (
                    <button
                      onClick={() => hapusItem(it.id)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                      title="Hapus dari daftar"
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>

                {sedangJalan && (
                  <div className="relative h-1.5 mt-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="up-geser absolute top-0 h-full w-2/5 bg-blue-600 rounded-full" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default UploadPanel;