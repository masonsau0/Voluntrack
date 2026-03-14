import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  devIndicators: false,
  async redirects() {
    return [
      { source: "/", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
