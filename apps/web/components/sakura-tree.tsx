/**
 * Ilustrasi pohon sakura (SVG inline, dekoratif).
 * Ditempatkan di pojok kanan atas beranda, memudar ke bawah supaya tidak
 * mengganggu teks. Murni CSS/SVG — tanpa library, aman untuk SSR.
 */
export function SakuraTree() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[420px] overflow-hidden dark:block"
    >
      <svg
        viewBox="0 0 900 420"
        preserveAspectRatio="xMaxYMin slice"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="branch" x1="900" y1="0" x2="120" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8a5a4a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8a5a4a" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="blossom" cx="0.35" cy="0.3" r="0.75">
            <stop stopColor="#ffe3ec" />
            <stop offset="1" stopColor="#ef7fa4" />
          </radialGradient>
          <linearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
            <stop stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="fadeMask">
            <rect width="900" height="420" fill="url(#fade)" />
          </mask>
        </defs>

        <g mask="url(#fadeMask)">
          {/* Batang utama: dari kanan atas melengkung ke kiri bawah */}
          <path
            d="M930 10C800 40 720 110 640 150C560 190 470 196 400 240C340 278 300 330 270 410"
            stroke="url(#branch)"
            strokeWidth="26"
            strokeLinecap="round"
          />
          {/* Cabang sekunder */}
          <path
            d="M700 128C760 150 830 150 900 132"
            stroke="url(#branch)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M560 192C600 240 640 300 650 400"
            stroke="url(#branch)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M470 224C430 270 400 300 340 320"
            stroke="url(#branch)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M780 118C800 90 810 60 805 20"
            stroke="url(#branch)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Kelompok bunga */}
          {[
            [706, 130, 1],
            [760, 142, 0.9],
            [818, 136, 0.85],
            [596, 196, 0.95],
            [640, 236, 0.8],
            [560, 190, 1],
            [470, 214, 0.9],
            [436, 250, 0.75],
            [352, 320, 0.8],
            [806, 62, 0.85],
            [640, 330, 0.7],
          ].map(([cx, cy, scale], index) => (
            <g key={index} transform={`translate(${cx} ${cy}) scale(${scale})`}>
              <circle cx="0" cy="0" r="9" fill="url(#blossom)" opacity="0.95" />
              <circle cx="13" cy="-7" r="7" fill="url(#blossom)" opacity="0.85" />
              <circle cx="-12" cy="-6" r="6.5" fill="url(#blossom)" opacity="0.8" />
              <circle cx="9" cy="10" r="6" fill="url(#blossom)" opacity="0.75" />
              <circle cx="-10" cy="11" r="5.5" fill="url(#blossom)" opacity="0.7" />
              <circle cx="2" cy="-3" r="2.6" fill="#c94f7c" opacity="0.4" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
