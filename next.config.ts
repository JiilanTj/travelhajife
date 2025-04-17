import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.palvis.my.id',
        pathname: '/public/**',
      },
      {
        protocol: 'https',
        hostname: 'api.palvis.my.id',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
