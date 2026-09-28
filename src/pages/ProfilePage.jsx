function ProfilePage() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Profil Pengguna
      </h1>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="NIP"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Jabatan"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Bidang"
          className="w-full border p-3 rounded-lg"
        />

        <button className="bg-blue-600 text-white px-5 py-3 rounded-lg">
          Simpan Profil
        </button>

      </div>

    </div>
  );
}

export default ProfilePage;