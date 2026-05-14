import { cpSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, ".vercel", "output");

// Static: dist/client/ → .vercel/output/static/
mkdirSync(join(out, "static"), { recursive: true });
cpSync(join(root, "dist", "client"), join(out, "static"), { recursive: true });

// Function: dist/server/ → .vercel/output/functions/ssr.func/
const funcDir = join(out, "functions", "ssr.func");
mkdirSync(funcDir, { recursive: true });
cpSync(join(root, "dist", "server"), funcDir, { recursive: true });

// Runtime config for Node.js 20
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify(
    { runtime: "nodejs20.x", handler: "index.js", launcherType: "Nodejs", shouldAddHelpers: false },
    null,
    2,
  ),
);

// Thin adapter: bridges Vercel's Node.js req/res to the Fetch API handler
writeFileSync(
  join(funcDir, "index.js"),
  `import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./server.js";

export default async function vercelHandler(req, res) {
  const host = req.headers["host"] ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const url = new URL(req.url, \`\${proto}://\${host}\`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((val) => headers.append(k, val));
    else headers.set(k, v);
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = Readable.toWeb(req);
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    duplex: "half",
  });

  const response = await handler.fetch(request, process.env, {
    waitUntil: () => {},
    passThroughOnException: () => {},
  });

  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}
`,
);

// Routing: static files first, then everything else to SSR function
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve pre-built static assets with long cache
        {
          src: "^/assets/(.+)$",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        // Static file check — let Vercel serve from output/static/
        { handle: "filesystem" },
        // Fallback: all other requests go to SSR function
        { src: "/(.*)", dest: "/ssr" },
      ],
    },
    null,
    2,
  ),
);

console.log("Vercel Build Output API structure assembled at .vercel/output/");
