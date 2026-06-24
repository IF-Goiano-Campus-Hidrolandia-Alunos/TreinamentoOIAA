/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O front definitivo sera reescrito amanha; nao deixamos o lint bloquear o deploy do backend.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
