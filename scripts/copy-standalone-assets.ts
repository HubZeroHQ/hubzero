import { cpSync, existsSync } from "fs";
import path from "path";

/**
 * `output: "standalone"` (`next.config.ts`) only emits the traced server
 * bundle — `public/` and `.next/static/` are deliberately left out (they
 * aren't part of the `require`/`import` graph a file tracer walks) and must
 * be copied alongside it by whoever assembles the deployable artifact. The
 * `Dockerfile` already does this for the container image; this script runs
 * the same two copies as an npm `postbuild` step so `.next/standalone/server.js`
 * is immediately runnable right after `next build`, without a Docker build —
 * matching what `npm run start` now runs (see `package.json`).
 */
const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.error('.next/standalone not found — is `output: "standalone"` set in next.config.ts?');
  process.exit(1);
}

cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });
cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});
