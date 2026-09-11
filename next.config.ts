import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // збірка для Docker: next/standalone тягне лише потрібні модулі
  output: "standalone",
  /* config options here */
};

export default nextConfig;
