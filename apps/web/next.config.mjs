/** @type {import('next').NextConfig} */
const MODULE_ROUTES = [
  "kana",
  "write",
  "vocab",
  "kanji",
  "grammar",
  "listening",
  "reading",
  "quiz",
  "ujian",
];

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@manabi/ui", "@manabi/content", "@manabi/srs"],
  /**
   * Modul kini berada di bawah segmen level (`/n5/vocab`), bukan lagi di akar.
   * Rute lama diarahkan permanen agar tautan lama dan bookmark tetap hidup.
   */
  async redirects() {
    return MODULE_ROUTES.map((module) => ({
      source: `/${module}`,
      destination: `/n5/${module}`,
      permanent: true,
    })).concat(
      MODULE_ROUTES.map((module) => ({
        source: `/${module}/:path*`,
        destination: `/n5/${module}/:path*`,
        permanent: true,
      })),
    );
  },
};

export default nextConfig;
