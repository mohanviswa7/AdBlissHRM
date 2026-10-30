const baseUrl = "https://app.ai.kredily.com";
const companyDashboardUrl = `${baseUrl}/kapi/v1/company/dashboard/`;
const employeeDashboardUrl = `${baseUrl}/kapi/v1/company/dashboard/employee`;
const notificationsUrl = `${baseUrl}/notifications/`;
const leaveCalendarUrl = process.env.KREDILY_LEAVE_CALENDAR_API_URL || "https://app.ai.kredily.com/kapi/v1/leave/calendar/";
const idCardUrl = process.env.KREDILY_ID_CARD_API_URL
  ? process.env.KREDILY_ID_CARD_API_URL
  : "https://blissdigitalmedia.ai.kredily.com/kapi/v1/idstudio/employees/916cac21-e382-4b29-9861-db2d5c5fada5/card-data/?type=id";

const leaveColors = {
  "Work From Home": "orange",
  "Casual Leave": "green",
  "Loss of Pay": "blue",
  "Comp Off": "red",
};
const count = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

async function fetchJson(url, label, { authorization } = {}) {
  const headers = { accept: "application/json" };
  if (authorization) headers.authorization = authorization;
  const response = await fetch(url, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error(`${label} API returned ${response.status}.`);
  const result = await response.json().catch(() => null);
  if (!result) throw new Error(`${label} API returned invalid JSON.`);
  return result;
}

const textValue = (value) => {
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();
  if (value && typeof value === "object")
    return String(value.name || value.full_name || "").trim();
  return "";
};

export async function loadIdCard() {
  const authorization =
    process.env.KREDILY_ID_CARD_AUTHORIZATION ||
    process.env.KREDILY_DIRECTORY_AUTHORIZATION;
  const result = await fetchJson(idCardUrl, "Employee ID card", {
    authorization,
  });
  const data = result.data ?? result;
  const employee =
    data.employee ??
    data.employee_data ??
    data.employee_details ??
    data.profile ??
    data;
  if (!employee || typeof employee !== "object" || Array.isArray(employee)) {
    throw new Error("Employee ID card API returned an invalid response.");
  }

  const pick = (...keys) =>
    keys.map((key) => textValue(employee[key])).find(Boolean) || "";
  const name = pick("employee_name", "full_name", "name");
  return {
    Name: name,
    Initials:
      pick("initials") ||
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase(),
    Email: pick("work_email", "official_email", "email"),
    EmployeeID: pick("employee_id", "employee_code", "employee_number"),
    Role: pick("designation", "job_title", "role", "title"),
    Department: pick("department_name", "department", "team"),
    Location: pick("work_location", "office_location", "location"),
    Joined: pick("date_of_joining", "joining_date", "joined"),
    Manager: pick("reporting_manager", "manager_name", "manager", "reports_to"),
  };
}

export async function loadLeaveCalendar(from, to) {
  const url = new URL(leaveCalendarUrl);
  url.searchParams.set("scope", "team");
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  const authorization = process.env.KREDILY_LEAVE_CALENDAR_AUTHORIZATION || process.env.KREDILY_OVERVIEW_AUTHORIZATION;
  const result = await fetchJson(url, "Leave calendar", { authorization });
  const data = result.data;
  if (result.status !== "success" || !data || !data.events || typeof data.events !== "object" || Array.isArray(data.events)) {
    throw new Error("Leave calendar API returned an invalid response.");
  }
  return {
    status:"success",
    data:{
      events:data.events,
      departments:Array.isArray(data.departments) ? data.departments : [],
    },
    message:result.message || "",
  };
}

export async function loadCompanyDashboard() {
  const result = await fetchJson(companyDashboardUrl, "Company dashboard");
  const company = result.data;
  if (result.status !== "success" || !company || typeof company !== "object") {
    throw new Error("Company dashboard API returned an invalid response.");
  }
  return {
    name: company.company_name,
    logo: company.company_logo,
    employeeName: company.employee_name,
    employeeLogo: company.employee_logo,
    designation: company.employee_designation,
    department: company.employee_department,
    role: company.role_display,
    totalEmployees: company.total_employees,
  };
}

export async function loadEmployeeDashboard() {
  const result = await fetchJson(employeeDashboardUrl, "Employee dashboard");
  const data = result.data;
  if (
    result.status !== "success" ||
    !data ||
    !Array.isArray(data.leave_balance)
  ) {
    throw new Error("Employee dashboard API returned an invalid response.");
  }

  const pendingActions = Array.isArray(data.pending_actions)
    ? data.pending_actions
    : [];
  const stats = data.stats || {};
  return {
    stats: {
      daysPresent: count(stats.days_present_month),
      leaveBalance: count(stats.leave_balance_total),
      pendingActions: count(
        stats.pending_actions_count ?? pendingActions.length,
      ),
    },
    leaveBalances: data.leave_balance.map((leave) => ({
      type: String(leave.type || "Leave"),
      balance: count(leave.balance),
      allowance: count(leave.total),
      used: count(leave.availed),
      accrued: count(leave.accrued),
      carryForward: count(leave.carry_forward),
      color: leaveColors[leave.type] || "orange",
    })),
    pendingActions: pendingActions.map((action) => ({
      id: action.id,
      type: action.type,
      description: String(action.description || ""),
      href:
        typeof action.href === "string" && action.href.startsWith("/")
          ? action.href
          : "/attendance",
    })),
    aiInsight: data.ai_insight ?? null,
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
      id: entry.uuid,
      title: String(entry.title || "").trim(),
      message: String(entry.message || "").trim(),
      category: entry.category || "",
    }));
}
