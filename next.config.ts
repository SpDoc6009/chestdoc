import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/a/:id", destination: "/articles/:id" },
      { source: "/r/:id", destination: "/reports/:id" },
      { source: "/p/:id", destination: "/pdfs/:id" },
      { source: "/t/:id", destination: "/teaching/lessons/:id" }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: "25mb"
    },
    webpackBuildWorker: false,
    workerThreads: false
  },
  typescript: {
    ignoreBuildErrors: true
  },
  outputFileTracingRoot: process.cwd(),
  typedRoutes: false
};

export default nextConfig;
