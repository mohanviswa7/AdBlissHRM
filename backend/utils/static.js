import { createReadStream, existsSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(fileURLToPath(new URL("../../frontend/", import.meta.url)));
const buildRoot = resolve(fileURLToPath(new URL("../../dist/", import.meta.url)));
const root = existsSync(buildRoot) ? buildRoot : sourceRoot;
const contentTypes = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };

export function serveStatic(pathname, response) {
  const requested = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  let file = resolve(root, requested);
  if (file !== root && !file.startsWith(`${root}${sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  if (!existsSync(file)) {
    if (root === buildRoot && existsSync(resolve(buildRoot,"index.html"))) file = resolve(buildRoot,"index.html");
    else {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
  }
  response.writeHead(200, { "content-type":contentTypes[extname(file)] || "application/octet-stream", "cache-control":"no-cache" });
  createReadStream(file).pipe(response);
}
