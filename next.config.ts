import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Smaller deploy artifact for Oracle VM (PM2 runs standalone server.js).
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
  // First-party proxy so analytics is less likely blocked by ad blockers.
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // Required for PostHog trailing-slash API requests.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
