/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: new URL('.', import.meta.url).pathname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
