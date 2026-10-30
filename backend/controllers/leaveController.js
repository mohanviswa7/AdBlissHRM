import { loadLeaveCalendar } from "../services/kredilyService.js";
import { sendJson } from "../utils/http.js";

const isDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export async function getCalendar({ response, url }) {
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  if (!isDate(from) || !isDate(to) || from > to) {
    return sendJson(response, 400, { error:"Provide a valid calendar date range." });
  }
  sendJson(response, 200, await loadLeaveCalendar(from, to));
}