import { idCardProfile, metrics, profile, store, timesheetWeek } from "../data/store.js";
import { initialsOf, sendJson } from "../utils/http.js";

export function getProfile({ response, session }) {
  const { user } = session;
  sendJson(response, 200, {
    profile:{
      ...profile,
      Name:user.name,
      Email:user.email,
      Role:user.role,
      Department:user.department,
      Initials:initialsOf(user.name),
    },
  });
}

export function getIdCard({ response, session }) {
  const { user } = session;
  sendJson(response, 200, {
    profile:{
      ...idCardProfile(),
      Name:user.name,
      Initials:initialsOf(user.name),
      Email:user.email,
      EmployeeID:user.employeeId,
      Role:user.role,
      Department:user.department,
    },
    metrics:metrics.idCard,
  });
}

export function getTimesheet({ response }) {
  sendJson(response, 200, { ...timesheetWeek(), records:store.timesheet, metrics:metrics.timesheet });
}
