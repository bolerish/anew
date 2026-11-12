import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    WxtVitest({ configFile: false }),
    {
      ...stylex.vite({
        // Match the published UI style keys and cascade layers when composing xstyle.
        dev: false,
        useCSSLayers: true,
        aliases: { "~shared/*": [resolve("entrypoints/shared/*")] },
        unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
      }),
      // Unit tests compile StyleX but do not need its development CSS polling.
      configureServer: undefined,
    },
  ],
  resolve: {
    alias: { "~": resolve("."), "~shared": resolve("entrypoints/shared"), "~newtab": resolve("entrypoints/newtab") },
  },
  optimizeDeps: { exclude: ["@bolerish/tokens"] },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["entrypoints/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
  },
});
