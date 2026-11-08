import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inventory is read from Postgres on each request; pages opt into dynamic
  // rendering explicitly, so Cache Components is left off for now.
  experimental: {
    // Photo uploads (one image per request) pass through proxy.ts
    proxyClientMaxBodySize: "15mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
