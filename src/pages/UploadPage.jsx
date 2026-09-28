import Header from "../components/layout/Header";
import { FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import { useState, useContext } from "react";
import { DocumentContext } from "../context/DocumentContext";

function UploadPage() {
const { documents, addDocument } = useContext(DocumentContext);
const [fileName, setFileName] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [isUploaded, setIsUploaded] = useState(false);


const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setSelectedFile(file);
  setFileName(file.name);
  setIsUploaded(false);
};


const handleUpload = () => {
  if (!selectedFile) {
    alert("Pilih file terlebih dahulu");
    return;
  }

   const fileUrl = URL.createObjectURL(selectedFile);

 addDocument({
  id: Date.now(),
  nama: selectedFile.name,
  kategori: "PDF",
  tanggal: new Date().toLocaleDateString(),
  fileUrl: URL.createObjectURL(selectedFile),
});

  alert("Dokumen berhasil diupload");

  setSelectedFile(null);
  setFileName("");
  setIsUploaded(true);
};



  return (
    <div>
      <Header />

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold">
          Upload Dokumen
        </h1>

        <p className="text-gray-500">
          Upload dan kelola dokumen arsip digital
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Upload Area */}
        <div className="col-span-2 bg-white rounded-2xl shadow p-8">

          <div className="border-2 border-dashed border-blue-400 rounded-2xl p-16 text-center">

            <FaCloudUploadAlt
              size={70}
              className="mx-auto text-blue-500"
            />

            <h2 className="text-3xl font-bold mt-4">
              Upload Dokumen PDF
            </h2>

            <p className="text-gray-500 mt-3">
              Drag & Drop file PDF di sini
            </p>

            <p className="text-gray-400 mt-2">
              atau
            </p>

            <label className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 cursor-pointer inline-block">

  Pilih File PDF

  <input
    type="file"
    accept=".pdf"
    className="hidden"
    onChange={handleFileChange}
  />

</label>

<button
  onClick={handleUpload}
  disabled={isUploaded}
  className={`mt-4 px-6 py-3 rounded-xl text-white ${
    isUploaded
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {isUploaded ? "Sudah Diupload" : "Upload Dokumen"}
</button>

{fileName && (
  <div className="mt-4 text-green-600 font-semibold">
    ✓ File dipilih: {fileName}
  </div>
)}

            <p className="text-sm text-gray-400 mt-5">
              Maksimal ukuran file 20 MB
            </p>

          </div>

        </div>

        {/* Informasi */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="font-bold text-xl mb-4">
            Informasi Upload
          </h2>

          <ul className="space-y-3 text-gray-600">

            <li>✓ Format PDF</li>

            <li>✓ Maksimal 20 MB</li>

            <li>✓ Nama file unik</li>

            <li>✓ Dokumen tersimpan otomatis</li>

          </ul>

        </div>

      </div>

     {/* Upload Terbaru */}
<div className="bg-white rounded-2xl shadow p-6 mt-6">

  <h2 className="text-xl font-bold mb-4">
    Upload Terbaru
  </h2>

  <div className="space-y-4">

    {documents.map((doc) => (

      <div
        key={doc.id}
        className="flex justify-between items-center border-b pb-3"
      >

        <div className="flex items-center gap-3">

          <FaFilePdf
            className="text-red-500"
            size={25}
          />

          <div>
            <p className="font-semibold">
              {doc.nama}
            </p>

            <p className="text-sm text-gray-500">
              {doc.tanggal}
            </p>
          </div>

        </div>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
          Berhasil
        </span>

      </div>

    ))}

  </div>

</div>


    </div>
  );
}

export default UploadPage;