const { writeFileSync } = require("fs");
const { join } = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  generateBuildId: async () => {
    const id = `${Date.now()}`;
    // Salva o buildId no public/
    writeFileSync(join(__dirname, "public", "BUILD_ID"), id);
    return id;
  },
  output: "standalone",
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
