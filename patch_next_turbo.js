const fs = require("fs");
const code = fs.readFileSync("next.config.ts", "utf8");

const newConfig = `import type { NextConfig } from "next";

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

export default nextConfig;`;

fs.writeFileSync("next.config.ts", newConfig);
