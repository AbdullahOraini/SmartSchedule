import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export only in production builds, not during dev
  // output: 'export', // Commented out for development
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ignore build errors for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
