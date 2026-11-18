import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure template starter directories are bundled with the serverless functions on Vercel
  outputFileTracingIncludes: {
    '/api/template/*': ['./vibecode-starters/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: '',
        pathname: "/**"
      }
    ]
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ['192.168.29.248'],
};

export default nextConfig;
