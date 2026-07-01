import type { NextConfig } from "next";

// `export default` is required here — the legacy config silently dropped
// site-wide settings by omitting it (see ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md §7).
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
