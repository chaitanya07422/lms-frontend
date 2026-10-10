import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Smaller deploy artifact for Oracle VM (PM2 runs standalone server.js).
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
