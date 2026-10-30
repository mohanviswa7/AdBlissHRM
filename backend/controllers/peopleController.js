import { getDirectoryConfig, loadDirectoryEmployees, loadDirectoryOverview } from "../services/kredilyDirectoryService.js";
import { sendJson } from "../utils/http.js";

export function getConfig({ response }) {
  sendJson(response, 200, getDirectoryConfig());
}

export async function getOverview({ response }) {
  sendJson(response, 200, { overview:await loadDirectoryOverview() });
}

export async function getDirectory({ response }) {
  const records = await loadDirectoryEmployees();
  sendJson(response, 200, { records, source:"kredily", count:records.length });
}
