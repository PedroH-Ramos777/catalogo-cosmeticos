import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    if (!process.env.BACKEND_INTERNAL_URL) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL}/api/v1/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
