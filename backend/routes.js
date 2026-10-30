import { getSession } from "./auth.js";
import * as attendance from "./controllers/attendanceController.js";
import * as auth from "./controllers/authController.js";
import * as dashboard from "./controllers/dashboardController.js";
import * as employeeDashboard from "./controllers/employeeDashboardController.js";
import * as leave from "./controllers/leaveController.js";
import * as modules from "./controllers/moduleController.js";
import * as notifications from "./controllers/notificationController.js";
import * as profile from "./controllers/profileController.js";
import { isRateLimited, rateLimitedPaths } from "./middleware/rateLimit.js";
import { sendJson } from "./utils/http.js";

// Routes that do not require a signed-in session.
const publicRoutes = [
  ["GET", "/api/health", auth.health],
  ["GET", "/api/auth/session", auth.session],
  ["POST", "/api/auth/signup", auth.signup],
  ["POST", "/api/auth/login", auth.login],
  ["POST", "/api/auth/otp/request", auth.otpRequest],
  ["POST", "/api/auth/otp/verify", auth.otpVerify],
  ["POST", "/api/auth/forgot-password", auth.forgotPassword],
  ["POST", "/api/auth/reset-password", auth.resetPassword],
  ["POST", "/api/auth/logout", auth.logout],
];

const protectedRoutes = [
  ["POST", "/api/auth/change-password", auth.changePassword],
  ["GET", "/api/dashboard/employee/my-leave-balance", employeeDashboard.getMyLeaveBalance],
  ["GET", "/api/dashboard/employee", employeeDashboard.getEmployeeDashboard],
  ["GET", "/api/dashboard", dashboard.getDashboard],
  ["GET", "/api/dashboard/attendance-birthday-anniversaries-holidays", dashboard.getAttendanceBirthdayAnniversariesHolidays],
  ["GET", "/api/dashboard/metrics", dashboard.getMetrics],
  ["GET", "/api/dashboard/shortcuts", dashboard.getShortcuts],
  ["GET", "/api/dashboard/leave-balance", employeeDashboard.getLeaveBalance],
  ["GET", "/api/dashboard/attendance", dashboard.getAttendance],
  ["GET", "/api/dashboard/announcements", dashboard.getAnnouncements],
  ["GET", "/api/dashboard/vouchers", dashboard.getVouchers],
  ["GET", "/api/dashboard/birthdays", dashboard.getBirthdays],
  ["GET", "/api/dashboard/anniversaries", dashboard.getAnniversaries],
  ["GET", "/api/dashboard/holidays", dashboard.getHolidays],
  ["GET", "/api/leave/calendar", leave.getCalendar],
  ["GET", "/api/attendance/clock", attendance.getClock],
  ["POST", "/api/attendance/clock", attendance.toggleClock],
  ["GET", "/api/notifications", notifications.listNotifications],
  ["PATCH", /^\/api\/notifications\/([a-z0-9-]+)\/read$/, notifications.markRead],
  ["POST", "/api/notifications/read-all", notifications.markAllRead],
  ["GET", "/api/modules", modules.listModules],
  ["GET", "/api/profile", profile.getProfile],
  ["GET", "/api/id-card", profile.getIdCard],
  ["GET", "/api/timesheet", profile.getTimesheet],
  ["GET", /^\/api\/modules\/([a-z-]+)$/, modules.handleModule],
  ["POST", /^\/api\/modules\/([a-z-]+)$/, modules.handleModule],
];

function findRoute(routes, method, pathname) {
  for (const [routeMethod, path, handler] of routes) {
    if (routeMethod !== method) continue;
    if (typeof path === "string") {
      if (path === pathname) return { handler, params:[] };
      continue;
    }
    const match = pathname.match(path);
    if (match) return { handler, params:match.slice(1) };
  }
  return null;
}

export async function handleApi(request, response, url) {
  const { pathname } = url;
  const method = request.method || "GET";

  if (method === "POST" && rateLimitedPaths.has(pathname) && isRateLimited(request, pathname)) {
    return sendJson(response, 429, { error:"Too many attempts. Please wait before trying again." });
  }

  const publicRoute = findRoute(publicRoutes, method, pathname);
  if (publicRoute) return publicRoute.handler({ request, response, url, params:publicRoute.params });

  const session = getSession(request);
  if (!session) return sendJson(response, 401, { error:"Sign in to continue." });

  const route = findRoute(protectedRoutes, method, pathname);
  if (!route) return sendJson(response, 404, { error:"API route not found." });
  return route.handler({ request, response, url, session, params:route.params });
}
