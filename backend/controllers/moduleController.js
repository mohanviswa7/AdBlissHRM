import { createRecord, metrics, store } from "../data/store.js";
import { readJson, sendJson } from "../utils/http.js";

const allowedModules = new Set(["people","attendance","timesheet","leave","payroll","expenses","performance","documents","insurance","connect","settings"]);

export function listModules({ response }) {
  sendJson(response, 200, { modules:Array.from(allowedModules) });
}

export async function handleModule({ request, response, params }) {
  const [module] = params;
  if (!allowedModules.has(module)) return sendJson(response, 404, { error:"Module not found." });

  if (request.method === "GET") {
    return sendJson(response, 200, {
      records:module === "people" ? store.employees : store[module] || [],
      metrics:metrics[module] || [],
    });
  }

  const body = await readJson(request);
  if (!body || Array.isArray(body) || typeof body !== "object" || Object.values(body).some((value) => typeof value === "string" && value.length > 4000)) {
    return sendJson(response, 400, { error:"Provide a valid record with fields no longer than 4,000 characters." });
  }
  if (!Object.keys(body).length) return sendJson(response, 400, { error:"Add some details before submitting." });

  const record = createRecord(module, body);
  if (module === "people") store.employees.unshift(record);
  else {
    store[module] ||= [];
    store[module].unshift(record);
  }
  sendJson(response, 201, { record, message:"Your update has been saved." });
}
