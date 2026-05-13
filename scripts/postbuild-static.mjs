// Normalize TanStack Start build output into a single /dist folder of static
// assets so Vercel (outputDirectory: "dist") can serve it as a plain SPA.
//
// TanStack Start static preset outputs _shell.html (not index.html).
// This script: flattens dist/client/ -> dist/, then renames _shell.html -> index.html
// so Vercel's SPA rewrite ("/(.*)" -> "/index.html") resolves correctly.
import { existsSync, rmSync, cpSync, mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const clientDir = resolve(dist, "client");
const serverDir = resolve(dist, "server");

const externalCandidates = [
  resolve(root, ".output/public"),
  resolve(root, ".tanstack/start/build/public"),
];

function promoteShellHtml(dir) {
  const shell = join(dir, "_shell.html");
  const index = join(dir, "index.html");
  if (existsSync(shell) && !existsSync(index)) {
    renameSync(shell, index);
    console.log("[postbuild-static] Renamed _shell.html -> index.html");
  }
}

if (existsSync(clientDir)) {
  const tmp = resolve(root, ".dist-client-tmp");
  if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
  renameSync(clientDir, tmp);
  if (existsSync(serverDir)) rmSync(serverDir, { recursive: true, force: true });
  for (const entry of readdirSync(tmp)) {
    cpSync(join(tmp, entry), join(dist, entry), { recursive: true });
  }
  rmSync(tmp, { recursive: true, force: true });
  promoteShellHtml(dist);
  const hasIndex = existsSync(join(dist, "index.html"));
  console.log(`[postbuild-static] index.html present: ${hasIndex}`);
  if (!hasIndex) {
    console.error("[postbuild-static] ERROR: no index.html after flatten — dist/ contents:");
    for (const f of readdirSync(dist)) console.error("  " + f);
    process.exit(1);
  }
  console.log("[postbuild-static] Done — dist/ ready for Vercel");
  process.exit(0);
}

const source = externalCandidates.find((p) => existsSync(p));
if (!source) {
  console.error("[postbuild-static] No static build output found. Looked in:", [
    clientDir,
    ...externalCandidates,
  ]);
  process.exit(1);
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(source, dist, { recursive: true });
promoteShellHtml(dist);
const hasIndex = existsSync(join(dist, "index.html"));
console.log(`[postbuild-static] index.html present: ${hasIndex}`);
if (!hasIndex) {
  console.error("[postbuild-static] ERROR: no index.html after copy");
  process.exit(1);
}
console.log(`[postbuild-static] Done — Copied ${source} -> dist/`);
