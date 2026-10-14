import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentContext } from "../context/DocumentContext";
import { TahunContext } from "../context/TahunContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaFileAlt,
  FaCalendarCheck,
  FaCalendarWeek,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
} from "react-icons/fa";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const WARNA_KATEGORI = [
  "#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#64748b",
];

const JENIS_FILE = [
  { label: "PDF", icon: FaFilePdf, teks: "text-red-500", bar: "bg-red-500" },
  { label: "Word", icon: FaFileWord, teks: "text-blue-500", bar: "bg-blue-500" },
  { label: "Excel", icon: FaFileExcel, teks: "text-green-600", bar: "bg-green-600" },
  { label: "PowerPoint", icon: FaFilePowerpoint, teks: "text-orange-500", bar: "bg-orange-500" },
];

// Ambil tanggal upload: utamanya dari createdAt (Firestore), cadangan dari teks "dd/mm/yyyy"
function ambilTanggal(doc) {
  const ts = doc.createdAt;
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(doc.tanggal || "");
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
}

function StatCard({ icon: Icon, label, nilai, catatan, bgIkon, warnaIkon, delay }) {
  return (
    <div
      className="anim-naik bg-white rounded-2xl shadow p-5 flex items-center gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`${bgIkon} ${warnaIkon} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon size={24} />
      </div>

      <div className="min-w-0">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-extrabold text-blue-950 leading-tight truncate">{nilai}</p>
        {catatan && <div className="text-xs mt-1">{catatan}</div>}
      </div>
    </div>
  );
}

function KartuPanel({ judul, aksi, delay, className = "", children }) {
  return (
    <div
      className={`anim-naik bg-white rounded-2xl shadow p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-blue-950">{judul}</h2>
        {aksi}
      </div>
      {children}
    </div>
  );
}

function KosongData({ teks = "Belum ada data untuk ditampilkan" }) {
  return (
    <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400 text-sm text-center">
      {teks}
    </div>
  );
}

function Dashboard() {
  const { documents } = useContext(DocumentContext);
  const navigate = useNavigate();

  // tahun anggaran yang dipilih saat login (dipakai untuk judul grafik)
  const { tahun: tahunAnggaran } = useContext(TahunContext);
  // tahun kalender sebenarnya, untuk hitungan "bulan ini" dan "bulan lalu"
  const tahunIni = new Date().getFullYear();

  const r = useMemo(() => {
    const now = new Date();
    const bulanSekarang = now.getMonth();
    const bulanLaluTgl = new Date(tahunIni, bulanSekarang - 1, 1);
    const tujuhHariLalu = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const perBulan = BULAN.map((b) => ({ bulan: b, dokumen: 0 }));
    const kategoriMap = {};
    const fileMap = {};
    let bulanIni = 0;
    let bulanLalu = 0;
    let mingguIni = 0;

    documents.forEach((doc) => {
      const kat = doc.kategori || "Lainnya";
      kategoriMap[kat] = (kategoriMap[kat] || 0) + 1;

      const tipe = doc.tipeFile || "Lainnya";
      fileMap[tipe] = (fileMap[tipe] || 0) + 1;

      const t = ambilTanggal(doc);
      if (!t) return;

      // dokumen sudah difilter per tahun anggaran, jadi cukup dihitung per bulan upload
      perBulan[t.getMonth()].dokumen += 1;
      if (t.getFullYear() === tahunIni && t.getMonth() === bulanSekarang) bulanIni += 1;
      if (t.getFullYear() === bulanLaluTgl.getFullYear() && t.getMonth() === bulanLaluTgl.getMonth()) {
        bulanLalu += 1;
      }
      if (t >= tujuhHariLalu) mingguIni += 1;
    });

    const perKategori = Object.entries(kategoriMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { perBulan, perKategori, fileMap, bulanIni, bulanLalu, mingguIni };
  }, [documents, tahunIni]);

  const total = documents.length;

  // Keterangan tren bulan ini dibanding bulan lalu
  let tren = <span className="text-gray-400">Belum ada data bulan lalu</span>;
  if (r.bulanLalu > 0) {
    const persen = Math.round(((r.bulanIni - r.bulanLalu) / r.bulanLalu) * 100);
    const naik = persen >= 0;
    tren = (
      <span className={`inline-flex items-center gap-1 font-medium ${naik ? "text-green-600" : "text-red-500"}`}>
        {naik ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
        {Math.abs(persen)}% dari bulan lalu
      </span>
    );
  } else if (r.bulanIni > 0) {
    tren = <span className="text-green-600 font-medium">Baru mulai bulan ini</span>;
  }

  const terbaru = documents.slice(0, 5);

  return (
    <div>

      {/* Judul */}
      <div className="mb-8">
        <h1 className="anim-slide-kiri text-2xl font-extrabold tracking-tight text-blue-950">
          Sistem Arsip Digital
        </h1>

        <p
          className="anim-slide-kiri text-gray-500 mt-2 text-lg"
          style={{ animationDelay: "120ms" }}
        >
          BIDANG AKUNTANSI PELAPORAN DAN SISTEM INFORMASI KEUANGAN DAERAH
        </p>

        <div
          className="anim-garis h-1 w-20 rounded-full bg-blue-600 mt-4"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <StatCard
          icon={FaFileAlt}
          label="Total Dokumen"
          nilai={total}
          catatan={<span className="text-gray-400">Seluruh arsip tersimpan</span>}
          bgIkon="bg-blue-100"
          warnaIkon="text-blue-600"
          delay={100}
        />
        <StatCard
          icon={FaCalendarCheck}
          label="Upload Bulan Ini"
          nilai={r.bulanIni}
          catatan={tren}
          bgIkon="bg-green-100"
          warnaIkon="text-green-600"
          delay={170}
        />
        <StatCard
          icon={FaCalendarWeek}
          label="7 Hari Terakhir"
          nilai={r.mingguIni}
          catatan={<span className="text-gray-400">Dokumen baru minggu ini</span>}
          bgIkon="bg-amber-100"
          warnaIkon="text-amber-600"
          delay={240}
        />
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        <KartuPanel judul={`Dokumen per Bulan (TA ${tahunAnggaran})`} delay={380} className="xl:col-span-2">
          <div className="h-72">
            {total === 0 ? (
              <KosongData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={r.perBulan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDokumen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v} dokumen`, "Upload"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dokumen"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#gradDokumen)"
                    dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </KartuPanel>

        <KartuPanel judul="Berdasarkan Jenis Surat" delay={450}>
          {total === 0 ? (
            <div className="h-72"><KosongData /></div>
          ) : (
            <>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={r.perKategori}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {r.perKategori.map((k, i) => (
                        <Cell key={k.name} fill={WARNA_KATEGORI[i % WARNA_KATEGORI.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${v} dokumen`, n]}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-blue-950">{total}</span>
                  <span className="text-xs text-gray-400">dokumen</span>
                </div>
              </div>

              <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {r.perKategori.map((k, i) => (
                  <li key={k.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: WARNA_KATEGORI[i % WARNA_KATEGORI.length] }}
                      />
                      <span className="truncate text-gray-600">{k.name}</span>
                    </span>
                    <span className="font-semibold text-blue-950 ml-2">{k.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </KartuPanel>

      </div>

      {/* Dokumen terbaru + jenis file */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        <KartuPanel
          judul="Dokumen Terbaru"
          delay={520}
          className="xl:col-span-2"
          aksi={
            <button
              onClick={() => navigate("/arsip")}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition"
            >
              Lihat semua <FaChevronRight size={10} />
            </button>
          }
        >
          {terbaru.length === 0 ? (
            <KosongData teks="Belum ada dokumen yang diupload" />
          ) : (
            <div className="space-y-1">
              {terbaru.map((doc) => {
                const jenis = JENIS_FILE.find((j) => j.label === doc.tipeFile) || JENIS_FILE[0];
                const Ikon = jenis.icon;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-blue-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Ikon className={`${jenis.teks} shrink-0`} size={24} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{doc.nama}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {doc.kategori} • {doc.tanggal}
                        </p>
                      </div>
                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium shrink-0">
                      {doc.tipeFile || "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </KartuPanel>

        <KartuPanel judul="Berdasarkan Jenis File" delay={590}>
          {total === 0 ? (
            <KosongData />
          ) : (
            <div className="space-y-5">
              {JENIS_FILE.map((j) => {
                const jumlah = r.fileMap[j.label] || 0;
                const persen = total ? Math.round((jumlah / total) * 100) : 0;
                const Ikon = j.icon;

                return (
                  <div key={j.label}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center gap-2 font-medium text-gray-700">
                        <Ikon className={j.teks} /> {j.label}
                      </span>
                      <span className="text-gray-500">
                        {jumlah} • {persen}%
                      </span>
                    </div>

                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`${j.bar} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </KartuPanel>

      </div>

    </div>
  );
}

export default Dashboard;