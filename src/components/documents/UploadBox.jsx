import { useState } from "react";
import { FaFilePdf, FaCloudUploadAlt } from "react-icons/fa";

function UploadBox() {

  const [fileName, setFileName] = useState("");

  const handleFile = (file) => {

    if (file && file.type === "application/pdf") {
      setFileName(file.name);
    } else {
      alert("Upload file PDF saja");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    handleFile(file);
  };

  const handleChange = (e) => {

    const file = e.target.files[0];

    handleFile(file);
  };

  return (

    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-blue-400 bg-white p-10 rounded-3xl text-center shadow-lg"
    >

      <FaCloudUploadAlt className="text-6xl text-blue-500 mx-auto mb-5" />

      <h2 className="text-2xl font-bold mb-2">
        Upload Dokumen PDF
      </h2>

      <p className="text-gray-500 mb-5">
        Drag & drop file PDF atau pilih file
      </p>

      <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl cursor-pointer">

        Pilih File

        <input
          type="file"
          accept=".pdf"
          hidden
          onChange={handleChange}
        />

      </label>

      {fileName && (

        <div className="mt-6 bg-gray-100 p-4 rounded-xl flex items-center justify-center gap-3">

          <FaFilePdf className="text-red-500 text-2xl" />

          <span className="font-medium">
            {fileName}
          </span>

        </div>

      )}

    </div>
  );
}

export default UploadBox;