import type { NextConfig } from 'next';
import { fileURLToPath } from 'url';

const nextConfig: NextConfig = {
  // Pins the workspace root explicitly — without it, Next.js's root
  // auto-detection can pick the wrong directory when a lockfile also exists
  // in a parent folder (e.g. a git worktree checked out under the repo).
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  allowedDevOrigins: ['dev.hubzero.in'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // The CMS was renamed to Studio (`/studio/**`) — these keep old `/cms/*`
  // bookmarks/dev links working during the transition. Temporary (302) since
  // the route structure may still shift; flip to `permanent: true` once
  // Studio has shipped and old links are no longer expected to update.
  async redirects() {
    return [
      {
        source: '/cms',
        destination: '/studio',
        permanent: false,
      },
      {
        source: '/cms/:path*',
        destination: '/studio/:path*',
        permanent: false,
      },
      {
        source: '/api/cms/:path*',
        destination: '/api/studio/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
