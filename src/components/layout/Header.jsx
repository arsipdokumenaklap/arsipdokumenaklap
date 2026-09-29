function Header() {
  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-6 flex justify-between items-center">

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
          BIDANG AKUNTANSI PELAPORAN DAN SISTEM INFORMASI KEUANGAN DAERAH
        </p>

        <div
          className="anim-garis h-1 w-20 rounded-full bg-blue-600 mt-4"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      <img
        src=""
        className="w-10 h-10 rounded-full"
      />

    </div>
  )
}

export default Header;