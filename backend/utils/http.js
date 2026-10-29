export function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
  response.end(JSON.stringify(payload));
}

export async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 64_000) throw Object.assign(new Error("Request body exceeds 64 KB."), { status:413 });
  }
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status:400 }); }
}

export function describeError(error, fallback) {
  if (error?.name === "TimeoutError") return "The request took too long.";
  return error instanceof Error ? error.message : fallback;
}

export function initialsOf(name = "") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
