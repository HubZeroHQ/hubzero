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
};

export default nextConfig;
