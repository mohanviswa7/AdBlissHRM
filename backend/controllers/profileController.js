import { metrics, profile, store, timesheetWeek } from "../data/store.js";
import { loadIdCard } from "../services/kredilyService.js";
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

export async function getIdCard({ response }) {
  const apiProfile = await loadIdCard();
  const name = apiProfile.Name || "";
  const cardProfile = {
    ...apiProfile,
    Name:name,
    Initials:apiProfile.Initials || initialsOf(name),
    color:apiProfile.color || "avatar-mohan",
  };
  const locationParts = String(cardProfile.Location || "").split(",").map((part) => part.trim()).filter(Boolean);
  const joinedYear = String(cardProfile.Joined || "").match(/\b(?:19|20)\d{2}\b/)?.[0] || cardProfile.Joined || "—";
  const cardMetrics = [
    { ...metrics.idCard[0], value:cardProfile.EmployeeID || "—" },
    { ...metrics.idCard[1], value:cardProfile.Department || "—", note:cardProfile.Department ? "Your current department" : "Not provided by Kredily" },
    { ...metrics.idCard[2], value:locationParts[0] || "—", note:locationParts.slice(1).join(", ") || "Current work location" },
    { ...metrics.idCard[3], value:joinedYear, note:cardProfile.Joined ? `Joined ${cardProfile.Joined}` : "Join date not provided" },
  ];
  sendJson(response, 200, {
    profile:cardProfile,
    metrics:cardMetrics,
  });
}

export function getTimesheet({ response }) {
  sendJson(response, 200, { ...timesheetWeek(), records:store.timesheet, metrics:metrics.timesheet });
}
