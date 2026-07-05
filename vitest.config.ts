import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §13's recommended minimal testing
 * setup — Vitest + a real MongoDB (via `mongodb-memory-server`, so the test
 * suite is self-contained and needs no external service, in CI or locally).
 * `tests/setup.ts` starts/stops the in-memory instance once for the whole
 * run and points `connectToDatabase()` (`lib/db.ts`) at it — tests exercise
 * the exact same Mongoose models and connection code the app uses, not a
 * mocked substitute.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globalSetup: "./tests/global-setup.ts",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    // Every test file connects to the same shared in-memory MongoDB
    // instance and clears all collections after each test (`tests/setup.ts`)
    // — running files in parallel would let one file's cleanup wipe another
    // file's in-progress data.
    fileParallelism: false,
  },
});
