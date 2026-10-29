import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { DataTable, MetricGrid } from "../../components/PagePrimitives.jsx";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function formatElapsed(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remaining}`;
}

function leavePercent(balance, allowance) {
  if (!allowance) return 0;
  return Math.min(100, (balance / allowance) * 100);
}

export default function Dashboard() {
  const { data = {}, onAction, quickLinks = [], clockedIn, user } = useOutletContext();
  const [elapsed, setElapsed] = useState(0);
  const company = data.company;
  const today = new Date();
  const displayName = typeof company?.employeeName === "string"
    ? company.employeeName
    : user?.name || "there";
  const firstName = displayName.trim().split(/\s+/)[0] || "there";
  const employeeDetails = company
    ? [company.role, company.designation, company.department].filter(Boolean).join(" · ")
    : [user?.role || "Employee", user?.department || "IT Department"].join(" · ");
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);
  const attendanceRows = (data.attendance || []).map((record) => ({
    ...record,
    Date: record.Date?.replace(/^Today, /, "") || "—",
    In: record["Check in"] || "—",
    Out: record["Check out"] || "—",
  }));
  const shortcuts = (data.shortcuts || []).filter(
    (shortcut) => shortcut.id === "connect" || shortcut.id === "holidays" || quickLinks.includes(shortcut.id),
  );
  const birthdays = data.birthdays || [];
  const anniversaries = data.anniversaries || [];
  const holidays = data.holidays || [];
  const leaveBalances = data.leaveBalances || [];
  const announcements = data.announcements || [];
  const vouchers = data.vouchers || [];

  useEffect(() => {
    if (!clockedIn) return undefined;
    const startedAt = data.clockStartedAt ? Date.parse(data.clockStartedAt) : Date.now();
    const updateElapsed = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [clockedIn, data.clockStartedAt]);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-columns">
        <main className="dashboard-primary">
          <header className="dashboard-heading">
            <h1>
              {company?.employeeLogo && <img className="dashboard-employee-avatar" src={company.employeeLogo} alt="" />}
              Good afternoon, {firstName} <span aria-hidden="true">👋</span>
            </h1>
            <p>{dateLabel} · {employeeDetails}</p>
          </header>

          {data.companyDashboardError && (
            <p className="dashboard-data-warning" role="status">
              Company details could not be loaded: {data.companyDashboardError}
            </p>
          )}

          {data.employeeDashboardError && (
            <p className="dashboard-data-warning" role="status">
              Leave balance could not be loaded from the server: {data.employeeDashboardError}
            </p>
          )}

          {company && (
            <section className="reference-panel company-overview">
              <div className="company-overview-brand">
                {company.logo && <img src={company.logo} alt="" />}
                <div>
                  <small>COMPANY</small>
                  <strong>{company.name || "Your company"}</strong>
                </div>
              </div>
              <div className="company-overview-count">
                <strong>{company.totalEmployees ?? "—"}</strong>
                <span>team members</span>
              </div>
            </section>
          )}

          <MetricGrid
            className="dashboard-metrics reference-metrics"
            metrics={(data.metrics || []).slice(0, 3)}
          />

          <section className="reference-panel shortcut-panel">
            <div className="reference-panel-heading">
              <h2><span className="heading-spark">⚡</span> Quick Access</h2>
              <button onClick={() => onAction("customize")}>
                Customisable <span aria-hidden="true">⚙</span>
              </button>
            </div>
            <div className="reference-shortcuts">
              {shortcuts.map((shortcut) => (
                <Link
                  className="reference-shortcut"
                  to={shortcut.href}
                  key={shortcut.id}
                >
                  <span
                    className="reference-shortcut-icon"
                    style={{ "--tile":shortcut.color }}
                    aria-hidden="true"
                  >
                    {shortcut.icon}
                  </span>
                  <span>{shortcut.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="reference-panel leave-panel">
            <div className="reference-panel-heading">
              <h2><span className="heading-spark">🌴</span> My Leave Balance</h2>
              <Link to="/leave">View leave <span aria-hidden="true">→</span></Link>
            </div>
            <div className="leave-summary">
              {leaveBalances.map((leave) => (
                <div className={`leave-summary-card ${leave.color}`} key={leave.type}>
                  <strong>{Number(leave.balance).toFixed(2).replace(/\.00$/, "")}</strong>
                  <span>{leave.type}</span>
                  <small>Used: {leave.used} / {leave.allowance}</small>
                </div>
              ))}
            </div>
            <div className="leave-progress-list">
              {leaveBalances.map((leave) => (
                <div className="leave-progress-row" key={leave.type}>
                  <span>{leave.type}</span>
                  <div className="leave-progress-track">
                    <span
                      className={`leave-progress-value ${leave.color}`}
                      style={{ width:`${leavePercent(leave.balance, leave.allowance)}%` }}
                    />
                  </div>
                  <strong className={leave.color}>{leave.balance} / {leave.allowance}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="reference-panel attendance-panel">
            <div className="reference-panel-heading">
              <h2><span className="heading-spark">🗓</span> My Attendance — October 2026</h2>
              <Link to="/attendance">View all <span aria-hidden="true">→</span></Link>
            </div>
            {data.attendanceSummary && (
              <div className="attendance-summary">
                <span className="present"><b>{data.attendanceSummary.present}</b> Present</span>
                <span className="absent"><b>{data.attendanceSummary.absent}</b> Absent</span>
                <span className="leave"><b>{data.attendanceSummary.leave}</b> On leave</span>
                <span className="late"><b>{data.attendanceSummary.late}</b> Late</span>
                <span><b>{data.attendanceSummary.total}</b> Total</span>
              </div>
            )}
            <DataTable
              headers={["Date", "In", "Out", "Hours", "Status"]}
              rows={attendanceRows}
            />
          </section>
        </main>

        <aside className="dashboard-aside">
          <section className="reference-panel reference-clock">
            <h2><span aria-hidden="true">◷</span> WORK HOURS</h2>
            <button
              className="reference-clock-button"
              onClick={() => onAction("clock")}
            >
              <span aria-hidden="true">●</span> {clockedIn ? "Clock Out" : "Clock In"}
            </button>
            <strong className="reference-clock-time">{formatElapsed(elapsed)}</strong>
            <span className="reference-clock-caption">worked today</span>
          </section>

          <section className="reference-panel announcements-panel">
            <h2>⚑ Announcements</h2>
            {announcements.map((announcement) => (
              <article key={announcement.id}>
                <strong>{announcement.title}</strong>
                <small>{new Date(announcement.postedAt).toLocaleDateString()}</small>
                <p>{announcement.message}</p>
              </article>
            ))}
          </section>

          

          <section className="reference-panel people-panel">
            <h2>🎂 Upcoming Birthdays</h2>
            {birthdays.map((person) => (
              <div className="reference-person-row" key={person.Name}>
                <span className={`reference-person-avatar ${person.color || ""}`}>
                  {person.logo ? <img src={person.logo} alt="" /> : person.Initials || initials(person.Name)}
                </span>
                <strong>{person.Name}</strong>
                <small>{person.date}</small>
              </div>
            ))}
          </section>

          <section className="reference-panel people-panel">
            <h2>🎉 Work Anniversaries</h2>
            {anniversaries.map((person) => (
              <div className="reference-person-row" key={person.Name}>
                <span className={`reference-person-avatar ${person.color || ""}`}>
                  {person.logo ? <img src={person.logo} alt="" /> : person.Initials || initials(person.Name)}
                </span>
                <strong>{person.Name}</strong>
                <small>{person.years ? `${person.years} yr · ` : ""}{person.date}</small>
              </div>
            ))}
          </section>

          <section className="reference-panel holidays-panel">
            <div className="reference-panel-heading">
              <h2>🇮🇳 Holidays</h2>
              <Link to="/leave">View all <span aria-hidden="true">→</span></Link>
            </div>
            {holidays.map((holiday) => {
              const date = new Date(`${holiday.date}T00:00:00`);
              return (
                <div className="holiday-row" key={holiday.id}>
                  <span>
                    <b>{new Intl.DateTimeFormat("en", { month:"short" }).format(date)}</b>
                    {date.getDate()}
                  </span>
                  <div>
                    <strong>{holiday.name}</strong>
                    <small>{holiday.note}</small>
                  </div>
                </div>
              );
            })}
          </section>
        </aside>
      </div>
    </div>
  );
}
