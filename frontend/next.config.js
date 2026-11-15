/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
  },
  async rewrites() {
    const backendOrigin = process.env.INTERNAL_API_ORIGIN || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

