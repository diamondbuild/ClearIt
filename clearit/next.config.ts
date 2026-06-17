import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Increase API route body size limit
  async headers() {
    return [];
  },
};

export default nextConfig;
