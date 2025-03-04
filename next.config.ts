import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ['img.clerk.com'],
      },
    output: "standalone"
};

export default nextConfig;
