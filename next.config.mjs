// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // adicione domínios se usar <Image>
    // domains: ['example.com'],
  },
  experimental: {
    typedRoutes: true, // se você estava usando
  },
};

export default nextConfig;
