import UploadBox from "../components/documents/UploadBox";
import Header from "../components/layout/Header";
import { useContext } from "react";
import { DocumentContext } from "../context/DocumentContext";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {
  PieChart,
  Pie,
  Cell
} from "recharts";

const data = [
  { bulan: "Jan", dokumen: 65 },
  { bulan: "Feb", dokumen: 90 },
  { bulan: "Mar", dokumen: 110 },
  { bulan: "Apr", dokumen: 130 },
  { bulan: "Mei", dokumen: 180 },
  { bulan: "Jun", dokumen: 120 },
  { bulan: "Jul", dokumen: 100 },
  { bulan: "Agu", dokumen: 125 },
  { bulan: "Sep", dokumen: 150 },
  { bulan: "Okt", dokumen: 165 },
  { bulan: "Nov", dokumen: 155 },
  { bulan: "Des", dokumen: 120 },
];

const kategoriData = [
  { name: "Surat Masuk", value: 320 },
  { name: "Surat Keluar", value: 280 },
  { name: "SPJ", value: 240 },
  { name: "Laporan", value: 180 },
];


function Dashboard() {

  const { documents } = useContext(DocumentContext);
  return (

    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"></div>
        <Header />
      

      {/* Cards */}

      <div className="bg-white p-6 rounded-2xl shadow mt-6">
  <h2 className="text-xl font-bold mb-4">
  
  </h2>

  <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={kategoriData}
      dataKey="value"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label
    >
      <Cell fill="#3b82f6" />
      <Cell fill="#22c55e" />
      <Cell fill="#f59e0b" />
      <Cell fill="#ef4444" />
    </Pie>
  </PieChart>
</ResponsiveContainer>
</div>
  
      <div className="bg-white p-6 rounded-2xl shadow mt-6">
  <h2 className="text-xl font-bold mb-4">
    Dokumen per Bulan
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="bulan" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="dokumen"
        stroke="#2563eb"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-gray-500">
            Total Dokumen
          </h2>

          <p className="text-3xl font-bold mt-2">
  {documents.length}
</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-gray-500">
            Upload Bulan Ini
          </h2>

          <p className="text-3xl font-bold mt-2">
            86
          </p>
        </div>

       
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

  {/* Grafik Pie */}
  <div className="bg-white p-6 rounded-2xl shadow">
    ...
  </div>

  {/* Grafik Line */}
  <div className="bg-white p-6 rounded-2xl shadow">
    ...
  </div>

</div>
        

      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-5 mt-8 overflow-x-auto">
        <h2 className="text-xl font-bold mb-5">
          Dokumen Terbaru
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left border-b">

              <th className="p-3">
                Nama Dokumen
              </th>

              <th className="p-3">
                Kategori
              </th>

              <th className="p-3">
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
  )
}

export default Dashboard;