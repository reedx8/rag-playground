import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb", // Me: default is '1mb'
    },
  },
};

export default nextConfig;
