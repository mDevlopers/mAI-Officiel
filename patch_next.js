const fs = require("fs");
let code = fs.readFileSync("next.config.ts", "utf8");
code = code.replace(
  "const nextConfig: NextConfig = {",
  `const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
      };
    }
    return config;
  },`
);
fs.writeFileSync("next.config.ts", code);
