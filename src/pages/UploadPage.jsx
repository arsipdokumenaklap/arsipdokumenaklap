import { useState, useContext, useRef } from "react";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaFileSignature,
  FaChevronDown,
  FaCheckCircle,
} from "react-icons/fa";
import { DocumentContext } from "../context/DocumentContext";

const JENIS_SURAT = ["Surat Masuk", "Surat Keluar", "Nota Dinas"];

const JENIS_FILE = [
  { label: "PDF", accept: ".pdf", icon: FaFilePdf, warna: "text-red-500" },
  { label: "Word", accept: ".doc,.docx", icon: FaFileWord, warna: "text-blue-500" },
  { label: "Excel", accept: ".xls,.xlsx", icon: FaFileExcel, warna: "text-green-600" },
];

const SEMUA_FORMAT = ".pdf,.doc,.docx,.xls,.xlsx";
const MAKS_UKURAN_FILE = 20 * 1024 * 1024; // 20 MB

const INFO_UPLOAD = [
  "Format PDF, Word, Excel",
  "Maksimal 20 MB",
  "Nama file unik",
  "Dokumen tersimpan otomatis",
];

function ikonUntukJenisFile(tipeFile) {
  return JENIS_FILE.find((j) => j.label === tipeFile) || JENIS_FILE[0];
}

// wadah dropdown dengan ikon di kiri dan panah di kanan
function SelectField({ icon: Icon, iconClass = "text-blue-400", children, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
      <Icon className={`${iconClass} shrink-0`} />
      <select
        {...props}
        className="w-full bg-transparent p-3 outline-none appearance-none cursor-pointer"
      >
        {children}
      </select>
      <FaChevronDown className="text-gray-400 text-sm shrink-0 pointer-events-none" />
    </div>
  );
}

function UploadPage() {
  const { documents, addDocument } = useContext(DocumentContext);
  const inputFileRef = useRef(null);

  const [namaSurat, setNamaSurat] = useState("");
  const [jenisSurat, setJenisSurat] = useState("");
  const [jenisFile, setJenisFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [sedangDrag, setSedangDrag] = useState(false);

  const jenisFileTerpilih = JENIS_FILE.find((j) => j.label === jenisFile);
  const IkonJenisFile = jenisFileTerpilih?.icon || FaFileAlt;
  const warnaIkonJenisFile = jenisFileTerpilih?.warna || "text-blue-400";

  // kembalikan pesan error kalau file tidak sesuai, atau null kalau aman
  const cekFile = (file) => {
    if (file.size > MAKS_UKURAN_FILE) {
      return "Ukuran file maksimal 20 MB";
    }

    if (jenisFileTerpilih) {
      const diizinkan = jenisFileTerpilih.accept
        .split(",")
        .map((ext) => ext.trim().toLowerCase());

      if (!diizinkan.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        return `File yang dipilih bukan format ${jenisFileTerpilih.label}. Silakan pilih file ${jenisFileTerpilih.accept}`;
      }
    }

    return null;
  };

  const kosongkanInputFile = () => {
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  // dipakai bersama oleh tombol "Pilih File" dan drag & drop
  const prosesFile = (file) => {
    if (!file) return;

    const pesanError = cekFile(file);
    if (pesanError) {
      alert(pesanError);
      kosongkanInputFile();
      return;
    }

    setSelectedFile(file);
    setIsUploaded(false);
  };

  const handleFileChange = (e) => prosesFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setSedangDrag(false);
    prosesFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setSedangDrag(true);
  };

  const handleUpload = () => {
    if (!namaSurat.trim()) return alert("Masukkan nama surat terlebih dahulu");
    if (!jenisSurat) return alert("Pilih jenis surat terlebih dahulu");
    if (!jenisFile) return alert("Pilih jenis file terlebih dahulu");
    if (!selectedFile) return alert("Pilih file terlebih dahulu");

    const pesanError = cekFile(selectedFile);
    if (pesanError) return alert(pesanError);

    addDocument({
      id: Date.now(),
      nama: namaSurat.trim(),
      namaFile: selectedFile.name,
      kategori: jenisSurat,
      tipeFile: jenisFile,
      tanggal: new Date().toLocaleDateString(),
      fileUrl: URL.createObjectURL(selectedFile),
    });

    alert("Dokumen berhasil diupload");

    setNamaSurat("");
    setJenisSurat("");
    setJenisFile("");
    setSelectedFile(null);
    setIsUploaded(true);
    kosongkanInputFile();
  };

  return (
     <div>

      {/* Judul halaman: masuk dari samping */}
      <div className="mb-8">
        <h1
          className="anim-slide-kiri text-2xl font-extrabold tracking-tight text-blue-950"
        >
          Sistem Arsip Digital
        </h1>

        <p
          className="anim-slide-kiri text-gray-500 mt-2 text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Upload dan kelola dokumen arsip digital
        </p>

        <div
          className="anim-garis h-1 w-20 rounded-full bg-blue-600 mt-4"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Form & Area Upload */}
        <div
          className="anim-naik lg:col-span-2 bg-white rounded-2xl shadow p-6 md:p-8"
          style={{ animationDelay: "150ms" }}
        >

          <div className="space-y-4 mb-6">

            <div>
              <label className="block text-sm mb-2 font-medium">
                Nama Surat
              </label>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                <FaFileSignature className="text-blue-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Contoh: Surat Undangan Rapat Koordinasi"
                  value={namaSurat}
                  onChange={(e) => setNamaSurat(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm mb-2 font-medium">
                  Jenis Surat
                </label>

                <SelectField
                  icon={FaFileAlt}
                  value={jenisSurat}
                  onChange={(e) => setJenisSurat(e.target.value)}
                >
                  <option value="" disabled>
                    Pilih jenis surat
                  </option>
                  {JENIS_SURAT.map((jenis) => (
                    <option key={jenis} value={jenis}>
                      {jenis}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium">
                  Jenis File
                </label>

                <SelectField
                  icon={IkonJenisFile}
                  iconClass={warnaIkonJenisFile}
                  value={jenisFile}
                  onChange={(e) => {
                    setJenisFile(e.target.value);
                    setSelectedFile(null);
                    kosongkanInputFile();
                  }}
                >
                  <option value="" disabled>
                    Pilih jenis file
                  </option>
                  {JENIS_FILE.map((jenis) => (
                    <option key={jenis.label} value={jenis.label}>
                      {jenis.label}
                    </option>
                  ))}
                </SelectField>
              </div>

            </div>

          </div>

          {/* Area drag & drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setSedangDrag(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl px-6 py-12 text-center transition-all duration-200 ${
              sedangDrag
                ? "border-blue-600 bg-blue-50 scale-[1.01]"
                : "border-blue-300 bg-white"
            }`}
          >

            <FaCloudUploadAlt
              size={64}
              className={`mx-auto text-blue-500 transition-transform duration-200 ${
                sedangDrag ? "-translate-y-1 scale-110" : ""
              }`}
            />

            <h2 className="text-2xl md:text-3xl font-bold mt-4 text-blue-950">
              Upload Dokumen{jenisFile ? ` ${jenisFile}` : ""}
            </h2>

            <p className="text-gray-500 mt-2">
              Drag & Drop file di sini
            </p>

            <p className="text-gray-400 text-sm my-2">
              atau
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">

              <label className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 active:scale-95 cursor-pointer transition font-medium">
                Pilih File{jenisFile ? ` ${jenisFile}` : ""}

                <input
                  ref={inputFileRef}
                  type="file"
                  accept={jenisFileTerpilih ? jenisFileTerpilih.accept : SEMUA_FORMAT}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={isUploaded}
                className={`px-6 py-3 rounded-xl text-white font-medium transition active:scale-95 ${
                  isUploaded
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isUploaded ? "Sudah Diupload" : "Upload Dokumen"}
              </button>

            </div>

            {selectedFile && (
              <div className="anim-naik mt-5 inline-flex items-center gap-2 bg-green-50 text-green-700 font-medium px-4 py-2 rounded-lg text-sm max-w-full">
                <FaCheckCircle className="shrink-0" />
                <span className="truncate">
                  File dipilih: {selectedFile.name}
                  {jenisSurat && ` — ${jenisSurat}`}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-400 mt-5">
              Maksimal ukuran file 20 MB
            </p>

          </div>

        </div>

        {/* Informasi */}
        <div
          className="anim-naik bg-white rounded-2xl shadow p-6 h-fit"
          style={{ animationDelay: "250ms" }}
        >

          <h2 className="font-bold text-xl mb-4 text-blue-950">
            Informasi Upload
          </h2>

          <ul className="space-y-3 text-gray-600">
            {INFO_UPLOAD.map((teks) => (
              <li key={teks} className="flex items-start gap-3">
                <FaCheckCircle className="text-green-500 mt-1 shrink-0" />
                <span>{teks}</span>
              </li>
            ))}
          </ul>

        </div>

      </div>

      {/* Upload Terbaru */}
      <div
        className="anim-naik bg-white rounded-2xl shadow p-6 mt-5"
        style={{ animationDelay: "350ms" }}
      >

        <h2 className="text-xl font-bold mb-4 text-blue-950">
          Upload Terbaru
        </h2>

        <div className="space-y-3">

          {documents.length === 0 && (
            <p className="text-gray-400 text-center py-6">
              Belum ada dokumen yang diupload
            </p>
          )}

          {documents.map((doc) => {
            const jenis = ikonUntukJenisFile(doc.tipeFile);
            const Ikon = jenis.icon;

            return (
              <div
                key={doc.id}
                className="flex justify-between items-center gap-3 border-b last:border-b-0 pb-3 last:pb-0"
              >

                <div className="flex items-center gap-3 min-w-0">

                  <Ikon className={`${jenis.warna} shrink-0`} size={25} />

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {doc.nama}
                    </p>

                    <p className="text-sm text-gray-500">
                      {doc.kategori}
                      {doc.tipeFile && ` • ${doc.tipeFile}`} • {doc.tanggal}
                    </p>
                  </div>

                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm shrink-0">
                  Berhasil
                </span>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}

export default UploadPage;