/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@manabi/ui", "@manabi/content", "@manabi/srs"],
};

export default nextConfig;
