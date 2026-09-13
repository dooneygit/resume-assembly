import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls to the Flask backend so the browser talks to one origin.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://127.0.0.1:5000/api/:path*" },
    ];
  },
};

export default nextConfig;
