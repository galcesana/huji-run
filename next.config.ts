import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dgalywir8tz8i.cloudfront.net', // Strava CDN
      },
      {
        protocol: 'https',
        hostname: '*.strava.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Google Auth images
      },
    ],
  },
};

export default nextConfig;
