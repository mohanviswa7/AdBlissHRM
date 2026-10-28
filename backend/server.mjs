import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRecord, idCardProfile, metrics, profile, store, timesheetWeek } from "./data/store.mjs";

const sourceRoot = resolve(fileURLToPath(new URL("../frontend/", import.meta.url)));
const buildRoot = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const root = existsSync(buildRoot) ? buildRoot : sourceRoot;
const port = Number(process.env.PORT || 3002);
const allowedModules = new Set(["people","attendance","timesheet","leave","payroll","expenses","performance","documents","insurance","connect","settings"]);
const contentTypes = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 64_000) throw Object.assign(new Error("Request body exceeds 64 KB."), { status:413 });
  }
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status:400 }); }
}

function serveStatic(pathname, response) {
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

function dashboardData() {
  return {
    metrics:metrics.dashboard,
    attendance:store.attendance.slice(0,3),
    birthdays:[
      {Name:"Dipti Narayan",Initials:"DN",role:"Product Designer",date:"Today! 🎂",color:"avatar-blue"},
      {Name:"Shailendra Kumar",Initials:"SK",role:"Engineering Manager",date:"5 Nov",color:"avatar-green"},
      {Name:"Pooja Sharma",Initials:"PS",role:"People Partner",date:"11 Nov",color:"avatar-rose"},
    ],
    clockedIn:store.clockedIn,
  };
}

async function handleApi(request, response, url) {
  const pathname = url.pathname;
  if (request.method === "GET" && pathname === "/api/health") return sendJson(response,200,{status:"ok",service:"kredily-hrm-api"});
  if (request.method === "GET" && pathname === "/api/dashboard") return sendJson(response,200,dashboardData());
  if (request.method === "GET" && pathname === "/api/modules") return sendJson(response,200,{modules:Array.from(allowedModules)});
  if (request.method === "GET" && pathname === "/api/profile") return sendJson(response,200,{profile});
  if (request.method === "GET" && pathname === "/api/id-card") return sendJson(response,200,{profile:idCardProfile(),metrics:metrics.idCard});
  if (request.method === "GET" && pathname === "/api/timesheet") return sendJson(response,200,{...timesheetWeek(),records:store.timesheet,metrics:metrics.timesheet});
  if (request.method === "POST" && pathname === "/api/attendance/clock") {
    store.clockedIn = !store.clockedIn;
    return sendJson(response,200,{clockedIn:store.clockedIn,changedAt:new Date().toISOString()});
  }
  const moduleMatch = pathname.match(/^\/api\/modules\/([a-z-]+)$/);
  if (moduleMatch) {
    const module = moduleMatch[1];
    if (!allowedModules.has(module)) return sendJson(response,404,{error:"Module not found."});
    if (request.method === "GET") return sendJson(response,200,{records:module==="people" ? store.employees : store[module] || [],metrics:metrics[module] || []});
    if (request.method === "POST") {
      const body = await readJson(request);
      if (!body || Array.isArray(body) || typeof body !== "object" || Object.values(body).some(value => typeof value === "string" && value.length > 4000)) {
        return sendJson(response,400,{error:"Provide a valid record with fields no longer than 4,000 characters."});
      }
      if (!Object.keys(body).length) return sendJson(response,400,{error:"Add some details before submitting."});
      const record = createRecord(module,body);
      if (module === "people") store.employees.unshift(record);
      else {
        store[module] ||= [];
        store[module].unshift(record);
      }
      return sendJson(response,201,{record,message:"Your update has been saved."});
    }
  }
  return sendJson(response,404,{error:"API route not found."});
}

const server = createServer(async (request,response) => {
  const url = new URL(request.url || "/",`http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    try { await handleApi(request,response,url); }
    catch (error) {
      sendJson(response,error.status || 500,{error:error.status ? error.message : "The server could not complete this request."});
      if (!error.status) console.error("API request failed:",error);
    }
    return;
  }
  if (request.method !== "GET") {
    response.writeHead(405,{"allow":"GET"});
    response.end("Method not allowed");
    return;
  }
  serveStatic(url.pathname,response);
});

server.listen(port,process.env.HOST || "127.0.0.1",() => console.log(`Kredily HRM frontend and API listening at http://localhost:${port}`));
