import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jspdf"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
      };
    }
    return config;
  },
};

export default nextConfig;
