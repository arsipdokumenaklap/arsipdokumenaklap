import { useNavigate } from "react-router-dom";

// Membuat bentuk roda gigi (path SVG) dari jumlah gigi dan ukuran
function gearPath(cx, cy, outer, inner, teeth, phaseDeg = 0) {
  const step = (Math.PI * 2) / teeth;
  const phase = (phaseDeg * Math.PI) / 180;
  const pt = (r, a) =>
    `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;

  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = phase + i * step;
    const points = [
      pt(inner, a - step * 0.3),
      pt(outer, a - step * 0.17),
      pt(outer, a + step * 0.17),
      pt(inner, a + step * 0.3),
    ];
    d += (i === 0 ? "M" : "L") + points[0];
    d += "L" + points[1] + "L" + points[2] + "L" + points[3];
  }
  d += "Z";

  // lubang di tengah roda gigi
  const hole = inner * 0.38;
  d +=
    `M${cx - hole} ${cy}` +
    `a${hole} ${hole} 0 1 0 ${hole * 2} 0` +
    `a${hole} ${hole} 0 1 0 ${-hole * 2} 0Z`;

  return d;
}

function Kata({ teks, mulai }) {
  return (
    <span className="dp-kata">
      {teks.split("").map((huruf, i) => (
        <span
          key={i}
          className="dp-huruf"
          style={{ animationDelay: `${(mulai + i) * 38}ms` }}
        >
          {huruf}
        </span>
      ))}
    </span>
  );
}

export default function DalamPengembangan({
  judul = "MENU INI DALAM PENGEMBANGAN",
  deskripsi = "Fitur ini sedang disiapkan oleh tim. Silakan kembali lagi nanti.",
  tampilkanTombol = true,
  ringkas = false,
}) {
  const navigate = useNavigate();

  // hitung posisi awal tiap kata supaya animasi huruf berurutan
  let hitung = 0;
  const kataKata = judul.split(" ").map((k) => {
    const mulai = hitung;
    hitung += k.length + 1;
    return { k, mulai };
  });

  return (
    <div className={`dp-kartu${ringkas ? " dp-ringkas" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap');

        .dp-kartu {
          --navy: #14226b;
          --kuning: #ffc61a;
          --abu: #5b6479;
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(20, 34, 107, 0.08);
          min-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        /* pita pembatas proyek di atas dan bawah */
        .dp-pita {
          height: 22px;
          flex-shrink: 0;
          background: repeating-linear-gradient(
            -45deg,
            var(--kuning) 0 16px,
            var(--navy) 16px 32px
          );
          animation: dp-geser 1.6s linear infinite;
        }
        .dp-pita.balik { animation-direction: reverse; }

        @keyframes dp-geser {
          from { background-position: 0 0; }
          to   { background-position: 45.254px 0; }
        }

        .dp-isi {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1.5rem;
          gap: 1.25rem;
        }

        /* roda gigi */
        .dp-gigi-a, .dp-gigi-b {
          transform-box: fill-box;
          transform-origin: center;
        }
        .dp-gigi-a { animation: dp-putar 12s linear infinite; }
        .dp-gigi-b { animation: dp-putar 8s linear infinite reverse; }

        @keyframes dp-putar {
          to { transform: rotate(360deg); }
        }

        /* judul: huruf muncul berurutan satu kali saat halaman dibuka */
        .dp-judul {
          font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
          font-weight: 800;
          color: var(--navy);
          font-size: clamp(2.25rem, 7vw, 4.75rem);
          line-height: 1;
          letter-spacing: 0.01em;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          column-gap: 0.32em;
          row-gap: 0.05em;
          max-width: 18ch;
        }
        .dp-kata { display: inline-block; white-space: nowrap; }
        .dp-huruf {
          display: inline-block;
          opacity: 0;
          animation: dp-naik 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
        }
        @keyframes dp-naik {
          from { opacity: 0; transform: translateY(0.6em) rotate(6deg); }
          to   { opacity: 1; transform: translateY(0) rotate(0); }
        }

        .dp-deskripsi {
          color: var(--abu);
          max-width: 46ch;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* bar kemajuan */
        .dp-bar {
          width: min(320px, 80%);
          height: 10px;
          border-radius: 999px;
          background: #e6e9f5;
          overflow: hidden;
        }
        .dp-bar-isi {
          height: 100%;
          width: 45%;
          border-radius: 999px;
          background: repeating-linear-gradient(
            -45deg,
            var(--kuning) 0 10px,
            #ffdd6b 10px 20px
          );
          background-size: 28.28px 100%;
          animation:
            dp-bar-jalan 2.4s ease-in-out infinite alternate,
            dp-geser-kecil 0.9s linear infinite;
        }
        @keyframes dp-bar-jalan {
          from { transform: translateX(-10%); width: 30%; }
          to   { transform: translateX(120%); width: 55%; }
        }
        @keyframes dp-geser-kecil {
          from { background-position: 0 0; }
          to   { background-position: 28.28px 0; }
        }

        .dp-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--navy);
          font-weight: 600;
          font-size: 0.95rem;
        }
        .dp-titik { display: inline-flex; gap: 4px; }
        .dp-titik i {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--navy);
          animation: dp-lompat 1.2s ease-in-out infinite;
        }
        .dp-titik i:nth-child(2) { animation-delay: 0.15s; }
        .dp-titik i:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dp-lompat {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        .dp-tombol {
          margin-top: 0.25rem;
          background: var(--navy);
          color: #fff;
          border: 0;
          padding: 0.8rem 1.6rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .dp-tombol:hover { background: #1c2f94; transform: translateY(-2px); }
        .dp-tombol:focus-visible { outline: 3px solid var(--kuning); outline-offset: 3px; }

        /* mode ringkas: banner pendek, cocok ditaruh di atas dashboard */
        .dp-ringkas { min-height: 0; }
        .dp-ringkas .dp-pita { height: 12px; }
        .dp-ringkas .dp-isi {
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          padding: 1rem 1.5rem;
          gap: 0.5rem 1.5rem;
        }
        .dp-ringkas svg { width: 96px; height: auto; }
        .dp-ringkas .dp-judul {
          font-size: clamp(1.4rem, 3.2vw, 2.4rem);
          max-width: none;
          justify-content: flex-start;
        }
        .dp-ringkas .dp-deskripsi,
        .dp-ringkas .dp-bar,
        .dp-ringkas .dp-tombol { display: none; }

        @media (prefers-reduced-motion: reduce) {
          .dp-pita, .dp-gigi-a, .dp-gigi-b, .dp-bar-isi, .dp-titik i {
            animation: none;
          }
          .dp-huruf { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="dp-pita" aria-hidden="true" />

      <div className="dp-isi">
        <svg
          viewBox="0 0 230 200"
          width="230"
          height="200"
          role="img"
          aria-label="Roda gigi berputar"
        >
          <g className="dp-gigi-a">
            <path
              d={gearPath(80, 90, 64, 52, 12, 0)}
              fill="#14226b"
              fillRule="evenodd"
            />
          </g>
          <g className="dp-gigi-b">
            <path
              d={gearPath(168, 138, 43, 33, 8, 7.5)}
              fill="#ffc61a"
              fillRule="evenodd"
            />
          </g>
        </svg>

        <h1 className="dp-judul" aria-label={judul}>
          {kataKata.map(({ k, mulai }) => (
            <Kata key={mulai} teks={k} mulai={mulai} />
          ))}
        </h1>

        <p className="dp-deskripsi">{deskripsi}</p>

        <div className="dp-bar" aria-hidden="true">
          <div className="dp-bar-isi" />
        </div>

        <div className="dp-status">
          Sedang dibangun
          <span className="dp-titik" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        {tampilkanTombol && (
          <button className="dp-tombol" onClick={() => navigate("/dashboard")}>
            Kembali ke Dashboard
          </button>
        )}
      </div>

      <div className="dp-pita balik" aria-hidden="true" />
    </div>
  );
}
