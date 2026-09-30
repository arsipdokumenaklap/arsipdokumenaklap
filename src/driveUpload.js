// Mengirim file ke Google Apps Script, yang akan menyimpannya
// ke folder Google Drive yang sudah ditentukan di sana.

const URL_DRIVE = import.meta.env.VITE_DRIVE_URL;
const SECRET_DRIVE = import.meta.env.VITE_DRIVE_SECRET;

function fileKeBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

// mengembalikan { id, viewUrl, previewUrl, downloadUrl }
export async function uploadKeDrive(file) {
  if (!URL_DRIVE || !SECRET_DRIVE) {
    throw new Error(
      "VITE_DRIVE_URL / VITE_DRIVE_SECRET belum diisi di file .env"
    );
  }

  const base64 = await fileKeBase64(file);

  const res = await fetch(URL_DRIVE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      secret: SECRET_DRIVE,
      fileName: file.name,
      mimeType: file.type,
      base64,
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Upload ke Google Drive gagal");
  }

  return data;
}
