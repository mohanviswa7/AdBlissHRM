import { store } from "../data/store.js";
import { loadEmployeeDashboard } from "../services/kredilyService.js";
import { describeError, sendJson } from "../utils/http.js";

export async function getEmployeeDashboard({ response }) {
  try {
    sendJson(response, 200, await loadEmployeeDashboard());
  } catch (error) {
    console.error("Employee dashboard API request failed:", error);
    sendJson(response, 502, { error:describeError(error, "Employee dashboard is unavailable.") });
  }
}

export async function getMyLeaveBalance({ response }) {
  try {
    const { leaveBalances } = await loadEmployeeDashboard();
    sendJson(response, 200, { leaveBalances });
  } catch (error) {
    console.error("Employee dashboard API request failed:", error);
    sendJson(response, 502, { error:describeError(error, "Leave balance is unavailable.") });
  }
}

export const getLeaveBalance = ({ response }) => sendJson(response, 200, { balances:store.leaveBalances });
