const baseUrl = "https://app.ai.kredily.com";
const companyDashboardUrl = `${baseUrl}/kapi/v1/company/dashboard/`;
const employeeDashboardUrl = `${baseUrl}/kapi/v1/company/dashboard/employee`;
const notificationsUrl = `${baseUrl}/notifications/`;

const leaveColors = { "Work From Home":"orange", "Casual Leave":"green", "Loss of Pay":"blue", "Comp Off":"red" };
const count = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers:{ accept:"application/json" },
    signal:AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`${label} API returned ${response.status}.`);
  const result = await response.json().catch(() => null);
  if (!result) throw new Error(`${label} API returned invalid JSON.`);
  return result;
}

export async function loadCompanyDashboard() {
  const result = await fetchJson(companyDashboardUrl, "Company dashboard");
  const company = result.data;
  if (result.status !== "success" || !company || typeof company !== "object") {
    throw new Error("Company dashboard API returned an invalid response.");
  }
  return {
    name:company.company_name,
    logo:company.company_logo,
    employeeName:company.employee_name,
    employeeLogo:company.employee_logo,
    designation:company.employee_designation,
    department:company.employee_department,
    role:company.role_display,
    totalEmployees:company.total_employees,
  };
}

export async function loadEmployeeDashboard() {
  const result = await fetchJson(employeeDashboardUrl, "Employee dashboard");
  const data = result.data;
  if (result.status !== "success" || !data || !Array.isArray(data.leave_balance)) {
    throw new Error("Employee dashboard API returned an invalid response.");
  }

  const pendingActions = Array.isArray(data.pending_actions) ? data.pending_actions : [];
  const stats = data.stats || {};
  return {
    stats:{
      daysPresent:count(stats.days_present_month),
      leaveBalance:count(stats.leave_balance_total),
      pendingActions:count(stats.pending_actions_count ?? pendingActions.length),
    },
    leaveBalances:data.leave_balance.map((leave) => ({
      type:String(leave.type || "Leave"),
      balance:count(leave.balance),
      allowance:count(leave.total),
      used:count(leave.availed),
      accrued:count(leave.accrued),
      carryForward:count(leave.carry_forward),
      color:leaveColors[leave.type] || "orange",
    })),
    pendingActions:pendingActions.map((action) => ({
      id:action.id,
      type:action.type,
      description:String(action.description || ""),
      href:typeof action.href === "string" && action.href.startsWith("/") ? action.href : "/attendance",
    })),
    aiInsight:data.ai_insight ?? null,
  };
}

export async function loadNotifications() {
  const result = await fetchJson(notificationsUrl, "Notifications");
  if (!Array.isArray(result.notifications)) {
    throw new Error("Notifications API returned an invalid response.");
  }
  return result.notifications
    .filter((entry) => entry && typeof entry.uuid === "string")
    .map((entry) => ({
      id:entry.uuid,
      title:String(entry.title || "").trim(),
      message:String(entry.message || "").trim(),
      category:entry.category || "",
    }));
}
