import { spawn } from "node:child_process";
import { createServer } from "node:net";

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

const apiPort = await getAvailablePort();
const api = spawn(process.execPath, ["--env-file=backend/.env", "backend/server.mjs"], {
  env: { ...process.env, PORT: String(apiPort) },
  stdio: "inherit",
});
let web;

function shutdown(code = 0) {
  api.kill("SIGTERM");
  web?.kill("SIGTERM");
  process.exitCode = code;
}

api.once("error", (error) => { console.error("Could not start the HRM API:", error); shutdown(1); });
api.once("exit", (code) => { if (code !== null && code !== 0) shutdown(code); });
process.once("SIGINT", () => shutdown());
process.once("SIGTERM", () => shutdown());

let apiReady = false;
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    const response = await fetch(`http://127.0.0.1:${apiPort}/api/health`);
    if (response.ok) { apiReady = true; break; }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
if (!apiReady) {
  console.error("The HRM API did not become ready.");
  shutdown(1);
} else {
  web = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--config", "vite.config.js"], {
    env: { ...process.env, HRM_API_PORT: String(apiPort) },
    stdio: "inherit",
  });
  web.once("error", (error) => { console.error("Could not start Vite:", error); shutdown(1); });
  web.once("exit", (code) => { if (code !== null && code !== 0) shutdown(code); });
}
