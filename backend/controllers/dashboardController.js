import { readFileSync } from "node:fs";
import { dashboardShortcuts, metrics, store } from "../data/store.js";
import { loadCompanyDashboard, loadEmployeeDashboard } from "../services/kredilyService.js";
import { describeError, sendJson } from "../utils/http.js";

function birthdays() {
  return [
    {Name:"Dipti Narayan",Initials:"DN",role:"Product Designer",date:"Today! 🎂",color:"avatar-blue"},
    {Name:"Shailendra Kumar",Initials:"SK",role:"Engineering Manager",date:"5 Nov",color:"avatar-green"},
    {Name:"Pooja Sharma",Initials:"PS",role:"People Partner",date:"11 Nov",color:"avatar-rose"},
  ];
}

function localDashboard() {
  return {
    metrics:metrics.dashboard.slice(0,3),
    attendance:store.attendance.slice(0,5),
    leaveBalances:store.leaveBalances,
    shortcuts:dashboardShortcuts,
    announcements:store.announcements,
    vouchers:store.vouchers,
    birthdays:birthdays(),
    anniversaries:store.anniversaries,
    holidays:store.holidays,
    clockedIn:store.clockedIn,
    clockStartedAt:store.clockStartedAt,
  };
}

function applyEmployeeDashboard(data, employee) {
  data.employee = employee;
  data.leaveBalances = employee.leaveBalances;
  data.metrics = [
    { label:"Days present", value:String(employee.stats.daysPresent), icon:"↗", note:"this month" },
    { label:"Leave balance", value:String(employee.stats.leaveBalance), icon:"◷", note:"days remaining" },
    {
      label:"Pending actions",
      value:String(employee.stats.pendingActions),
      icon:"!",
      note:employee.pendingActions[0]?.description || "You're all caught up",
    },
  ];
}

export async function getDashboard({ response }) {
  const data = localDashboard();
  applyOverview(data);
  try {
    applyEmployeeDashboard(data, await loadEmployeeDashboard());
  } catch (error) {
    console.error("Employee dashboard API request failed:", error);
    data.employeeDashboardError = describeError(error, "Employee dashboard is unavailable.");
  }
  try {
    data.company = await loadCompanyDashboard();
  } catch (error) {
    console.error("Company dashboard API request failed:", error);
    data.companyDashboardError = describeError(error, "Company details are unavailable.");
  }
  sendJson(response, 200, data);
}

const overview = JSON.parse(readFileSync(new URL("../data/dashboardOverview.json", import.meta.url), "utf8"));

const shortDate = (value) => new Intl.DateTimeFormat("en-GB", { day:"numeric", month:"short" }).format(new Date(`${value}T00:00:00`));
const initialsOf = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function applyOverview(data) {
  const { attendance, announcements, events } = overview.data;
  const person = (entry, date) => ({
    Name:entry.name.trim(),
    Initials:initialsOf(entry.name),
    logo:entry.logo,
    date,
  });
  data.attendanceSummary = {
    present:attendance.present_count,
    absent:attendance.absent_count,
    leave:attendance.leave_count,
    late:attendance.late_count,
    total:attendance.total_count,
  };
  data.announcements = announcements.map((entry) => ({
    id:entry.id,
    title:entry.type || "Announcement",
    message:entry.message.trim(),
    postedAt:entry.created_on,
  }));
  data.birthdays = events.birthdays.map((entry) => person(entry, entry.in_days === 0 ? "Today! 🎂" : shortDate(entry.date)));
  data.anniversaries = events.anniversaries.map((entry) => ({
    ...person(entry, shortDate(entry.date)),
    years:entry.years,
  }));
  data.holidays = events.holidays.map((entry, index) => ({
    id:`${entry.date}-${index}`,
    name:entry.title,
    date:entry.date,
    note:entry.is_optional ? "Optional holiday" : "Company holiday",
  }));
}

export const getAttendanceBirthdayAnniversariesHolidays = ({ response }) => sendJson(response, 200, overview);

export const getMetrics = ({ response }) => sendJson(response, 200, { metrics:metrics.dashboard.slice(0,3) });
export const getShortcuts = ({ response }) => sendJson(response, 200, { shortcuts:dashboardShortcuts });
export const getAttendance = ({ response }) => sendJson(response, 200, { records:store.attendance });
export const getAnnouncements = ({ response }) => sendJson(response, 200, { announcements:store.announcements });
export const getVouchers = ({ response }) => sendJson(response, 200, { vouchers:store.vouchers });
export const getBirthdays = ({ response }) => sendJson(response, 200, { birthdays:birthdays() });
export const getAnniversaries = ({ response }) => sendJson(response, 200, { anniversaries:store.anniversaries });
export const getHolidays = ({ response }) => sendJson(response, 200, { holidays:store.holidays });
