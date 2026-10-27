import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { existsSync } from "node:fs";
import { localState } from "./scripts/local-state.mjs";

// Preserve the RSC/SSR environments required by the pinned Vinext beta.5.
export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      configPath: existsSync("wrangler.local.json") ? "wrangler.local.json" : "wrangler.jsonc",
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
      persistState: { path: localState },
    }),
  ],
});
