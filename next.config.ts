import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
