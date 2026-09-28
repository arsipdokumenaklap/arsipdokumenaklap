import { useParams } from "react-router-dom";
import { useContext } from "react";
import { DocumentContext } from "../context/DocumentContext";

function ViewDocumentPage() {

  const { id } = useParams();

  const { documents } = useContext(DocumentContext);

  const doc = documents.find(
    (item) => item.id === Number(id)
  );

  if (!doc) {
    return (
      <div>
        Dokumen tidak ditemukan
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h1 className="text-2xl font-bold mb-4">
        Detail Dokumen
      </h1>

      <div className="space-y-3">

        <p>
          <b>Nama:</b> {doc.nama}
        </p>

        <p>
          <b>Kategori:</b> {doc.kategori}
        </p>

        <p>
          <b>Tanggal:</b> {doc.tanggal}
        </p>

      </div>

    </div>
  );
}

export default ViewDocumentPage;
