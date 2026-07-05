import type { NextConfig } from "next";

// `export default` is required here — the legacy config silently dropped
// site-wide settings by omitting it (see ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md §7).
const nextConfig: NextConfig = {
  output: "standalone",
  // `sharp`'s ESM build (`dist/utility.mjs`) has a self-reference bug when
  // Next's own bundler processes it via dynamic import — the same package
  // works correctly everywhere it's used directly (`lib/cms/media.ts`'s
  // CJS-style import). Marking it external skips Next's bundling for this
  // package entirely, matching the standard fix for this class of
  // native-binary-package interop bug.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
