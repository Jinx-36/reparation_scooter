import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    serverRuntimeConfig: {
      apiLogPath: './api.log'
    }
};

export default nextConfig;
