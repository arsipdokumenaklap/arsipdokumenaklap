import Header from "../components/layout/Header";
import { useContext } from "react";
import { DocumentContext } from "../context/DocumentContext";

function ArsipPage() {

  const { documents } = useContext(DocumentContext);

  return (
    <div>

      <Header />

      <h1 className="text-3xl font-bold mt-6">
        Arsip Dokumen
      </h1>

      <p className="text-gray-500 mb-6">
        Daftar seluruh dokumen yang telah diupload
      </p>

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

            {documents.map((doc) => (

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

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ArsipPage;