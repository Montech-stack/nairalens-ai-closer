// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel (VERCEL=1 is auto-injected by Vercel's build pipeline):
//   - cloudflare: false  → skips @cloudflare/vite-plugin (which otherwise forces Worker output)
//   - preset: "static"   → TanStack Start outputs dist/client/ (flattened by postbuild script)
//   - spa: true          → single HTML shell, client-side routing
// On Lovable/local, both are left at their defaults (Cloudflare Worker mode).
const onVercel = !!process.env.VERCEL;

export default defineConfig({
  cloudflare: onVercel ? false : undefined,
  tanstackStart: {
    server: {
      preset: onVercel ? "static" : undefined,
      entry: "server",
    },
    ...(onVercel ? { spa: { enabled: true } } : {}),
  },
});
