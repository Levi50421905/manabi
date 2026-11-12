/** @type {import('next').NextConfig} */
const MODULE_ROUTES = [
  "kana",
  "write",
  "vocab",
  "kanji",
  "bacaan-kanji",
  "grammar",
  "partikel",
  "konteks",
  "listening",
  "reading",
  "ulasan",
  "quiz",
  "ujian",
];

/**
 * Modul berada di bawah segmen level (`/n5/vocab`). Rute lama diarahkan
 * permanen agar tautan lama, bookmark, dan hasil pencarian tetap hidup.
 *
 * `bank` tidak lagi menjadi halaman: Bank Soal adalah lapisan data untuk
 * Latihan Soal dan Simulasi Ujian, jadi tautan lamanya dialihkan ke Latihan.
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@manabi/ui", "@manabi/content", "@manabi/srs"],
  async redirects() {
    const moduleRedirects = MODULE_ROUTES.flatMap((module) => [
      {
        source: `/${module}`,
        destination: `/n5/${module}`,
        permanent: true,
      },
      {
        source: `/${module}/:path*`,
        destination: `/n5/${module}/:path*`,
        permanent: true,
      },
    ]);

    return [
      ...moduleRedirects,
      {
        source: "/bank",
        destination: "/n5/quiz",
        permanent: true,
      },
      {
        source: "/bank/:path*",
        destination: "/n5/quiz",
        permanent: true,
      },
      {
        source: "/:level(n5|n4|n3|n2|n1)/bank",
        destination: "/:level/quiz",
        permanent: true,
      },
      {
        source: "/:level(n5|n4|n3|n2|n1)/bank/:path*",
        destination: "/:level/quiz",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
