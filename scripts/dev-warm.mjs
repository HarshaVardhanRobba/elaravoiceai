// Starts `next dev` and, once the server is up, hits /api/webhook until it
// compiles (returns 200). In dev, Next compiles a route on first request and
// drains the request body during that compile, so the first real Stream
// webhook would arrive with 0 bytes and fail HMAC verification. Pre-compiling
// the route here closes that window automatically. Zero extra dependencies.

import { spawn } from "node:child_process";

const PORT = process.env.PORT || "3000";
const WARM_URL = `http://localhost:${PORT}/api/webhook`;

const dev = spawn("npx", ["next", "dev", "--webpack"], {
  stdio: "inherit",
  shell: true,
});

dev.on("exit", (code) => process.exit(code ?? 0));

const warm = async () => {
  for (let attempt = 1; attempt <= 60; attempt++) {
    try {
      const res = await fetch(WARM_URL);
      if (res.ok) {
        console.log(`\n🔥 /api/webhook warm (compiled) after ${attempt} tr${attempt === 1 ? "y" : "ies"}\n`);
        return;
      }
    } catch {
      // Server not listening yet; keep retrying.
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.warn("\n⚠️ Could not warm /api/webhook after 60s; hit the URL manually.\n");
};

warm();
