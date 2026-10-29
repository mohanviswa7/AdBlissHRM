import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import "./module.css";

const get = (person, ...keys) => {
  for (const key of keys) {
    const value = person?.[key];
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "object") return value.name || value.title || value.label || "—";
      return value;
    }
  }
  return "—";
};
const fullName = (person) => {
  const suppliedName = get(person, "Name", "name", "full_name", "fullName", "employee_name");
  if (suppliedName !== "—") return String(suppliedName).trim() || "—";
  return [person?.first_name, person?.middle_name, person?.last_name]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(" ") || "—";
};
const roleOf = (person) => get(person, "Role", "role", "Designation", "designation", "current_designation__designation_name", "job_title", "title");
const teamOf = (person) => get(person, "Department", "department", "department__dept_name", "team", "team_name");
const photoOf = (person) => get(person, "Photo", "photo", "Avatar", "avatar", "employee_logo", "image", "profile_picture", "profile_image", "image_url");
const employeeIdOf = (person) => get(person, "EmployeeID", "employeeId", "employee_id", "employee_number", "id", "uu");
const locationOf = (person) => get(person, "Location", "location", "Office", "office", "work_location__title", "work_location");
const joinedOf = (person) => get(person, "Joined", "joined", "JoiningDate", "joiningDate", "date_of_join", "date_of_joining", "dateOfJoining");
const initialsFor = (person) => {
  const supplied = get(person, "Initials", "initials");
  return supplied !== "—" ? supplied : String(fullName(person)).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
};
const tenure = (person) => {
  const raw = joinedOf(person);
  if (raw === "—") return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const months = Math.max(0, (new Date().getFullYear() - date.getFullYear()) * 12 + new Date().getMonth() - date.getMonth());
  return `${Math.floor(months / 12)}.${Math.floor((months % 12) / 12 * 10)}y`;
};
const yearsAtCompany = (person) => {
  const raw = joinedOf(person);
  if (raw === "—") return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const years = Math.max(0, (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${years.toFixed(1)}y`;
};

export default function People() {
  const { data = {}, onAction } = useOutletContext() || {};
  const peopleOverview = useSelector((state) => state.hrm.peopleOverview);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [view, setView] = useState("Discover");
  const peopleSource = Array.isArray(data.records) ? data.records : [];
  const departments = useMemo(() => ["All", ...new Set(peopleSource.map(teamOf).filter((team) => team !== "—" && team !== "Unassigned"))], [peopleSource]);
  const people = useMemo(() => peopleSource.filter((person) => {
    const searchText = [fullName(person), roleOf(person), teamOf(person), get(person, "Location", "location", "Office", "office", "work_location"), get(person, "Email", "email", "work_email")].join(" ").toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase().trim());
    const matchesDepartment = department === "All" || teamOf(person) === department;
    const matchesView = view !== "My Network" || person.connected === true || person.Connected === true || person.is_connected === true;
    return matchesQuery && matchesDepartment && matchesView;
  }), [peopleSource, query, department, view]);

  const exportPeople = () => {
    const rows = [["Name", "Role", "Department", "Location", "Email", "Employee ID", "Joined"], ...people.map((person) => [fullName(person), roleOf(person), teamOf(person), locationOf(person), get(person, "Email", "email", "work_email"), employeeIdOf(person), joinedOf(person)])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "adbliss-people.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="ad-people-page">
    <header className="people-heading-row">
      <div className="people-heading-title"><h1>People · <span>{view}</span></h1><p>· Find colleagues · share work · build network</p></div>
      <div className="people-heading-actions"><button className="people-pill-button" onClick={() => onAction?.("profile")}>✎ Edit profile</button><button className="people-pill-button people-pill-primary" onClick={() => onAction?.("module-action")}>☁ Konnect</button></div>
    </header>

    <nav className="ad-people-tabs" aria-label="People views">{["Discover", "My Network", "New & Notable", "Directory"].map((tab) => <button key={tab} className={view === tab ? "active" : ""} onClick={() => setView(tab)}>{tab}</button>)}</nav>

    <label className="people-search people-search-large"><span className="people-search-spark">✦</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find anyone · name, department, location..."/><kbd>⌘K</kbd>{query && <button className="ad-people-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>

    <div className="ad-people-quick-links">
      <button className="ad-people-quick-card" onClick={() => { setView("New & Notable"); setDepartment("All"); setQuery(""); }}><span className="ad-people-quick-icon green">🌱</span><strong>New Joiners</strong><small>last 30 days</small></button>
      <button className="ad-people-quick-card" onClick={() => { setView("New & Notable"); setDepartment("All"); setQuery(""); }}><span className="ad-people-quick-icon pink">🎉</span><strong>Celebrations</strong><small>this week</small></button>
    </div>

    <div className="people-departments" aria-label="Filter by department">{departments.map((name) => <button key={name} className={`department-chip ${department === name ? "selected" : ""}`} onClick={() => setDepartment(name)}>{name === "All" ? "All" : name}</button>)}</div>

    <div className="ad-people-results-head"><div><strong>{view === "Directory" ? "Employee directory" : view === "My Network" ? "My Network" : view === "New & Notable" ? "New & Notable" : ""}</strong><p>{people.length} employees</p></div><button className="people-export-button" onClick={exportPeople}>↓ Export</button></div>

    {data.error ? <div className="people-api-warning"><strong>Employee API connection needed</strong><span>{data.error}</span></div> : data.source === "kredily" ? <div className="people-api-status">Connected to the employee directory · {data.count ?? peopleSource.length} employee records loaded</div> : null}
    {peopleOverview.loading ? <div className="people-api-status">Loading new joiners and overview data…</div> : peopleOverview.error ? <div className="people-api-warning"><strong>Overview API needs attention</strong><span>{peopleOverview.error}</span></div> : peopleOverview.data ? <div className="people-api-status">Kredily overview data loaded successfully.</div> : null}
    <div className="people-grid people-grid-kredily">
      {people.map((person, index) => {
        const name = fullName(person); const photo = photoOf(person); const location = locationOf(person); const duration = yearsAtCompany(person);
        return <article className="person-card ad-person-card" key={employeeIdOf(person) !== "—" ? employeeIdOf(person) : `${name}-${index}`} onClick={() => setSelectedPerson(person)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelectedPerson(person); }}>
          <div className="people-card-band" />
          <div className="people-avatar-wrap"><div className={`person-portrait ${person.color || ["avatar-violet", "avatar-blue", "avatar-green", "avatar-rose", "avatar-gold"][index % 5]}`}>{photo !== "—" ? <img src={photo} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : initialsFor(person)}</div><i className="people-status-dot" /></div>
          <h2>{name}</h2><p className="people-card-role">{roleOf(person)}{teamOf(person) !== "—" ? ` · ${teamOf(person)}` : ""}</p>
          <p className="people-card-location">{location !== "—" ? location : "Office not specified"}{duration ? ` · ${duration}` : ""}</p>
          <div className="people-card-actions"><button aria-label={`Message ${name}`} title="Message" onClick={(event) => { event.stopPropagation(); const email = get(person, "Email", "email", "work_email"); if (email !== "—") window.location.href = `mailto:${email}`; else setSelectedPerson(person); }}>☁</button><button aria-label={`View ${name} profile`} title="View profile" onClick={(event) => { event.stopPropagation(); setSelectedPerson(person); }}>↗</button></div>
        </article>;
      })}
    </div>

    {!people.length && <div className="people-empty-state"><strong>{peopleSource.length ? "No employees match your filters" : "Employee directory is not connected yet"}</strong><p>{peopleSource.length ? "Try another name or department." : "Once the Kredily API credentials are configured on the backend, employee records will appear here automatically."}</p>{(query || department !== "All" || view === "My Network") && <button onClick={() => { setQuery(""); setDepartment("All"); setView("Discover"); }}>Clear filters</button>}</div>}

    {selectedPerson && <div className="ad-person-modal-backdrop" role="presentation" onClick={() => setSelectedPerson(null)}><section className="ad-person-modal" role="dialog" aria-modal="true" aria-label={`${fullName(selectedPerson)} profile`} onClick={(event) => event.stopPropagation()}><button className="ad-person-modal-close" onClick={() => setSelectedPerson(null)} aria-label="Close profile">×</button><div className={`person-portrait ${selectedPerson.color || "avatar-violet"}`}>{photoOf(selectedPerson) !== "—" ? <img src={photoOf(selectedPerson)} alt={fullName(selectedPerson)} /> : initialsFor(selectedPerson)}</div><span className="ad-person-modal-eyebrow">EMPLOYEE PROFILE</span><h2>{fullName(selectedPerson)}</h2><p className="ad-person-modal-role">{roleOf(selectedPerson)} · {teamOf(selectedPerson)}</p><div className="ad-person-detail-list"><div><span>Employee ID</span><strong>{employeeIdOf(selectedPerson)}</strong></div><div><span>Work location</span><strong>{locationOf(selectedPerson)}</strong></div><div><span>Work email</span><strong>{get(selectedPerson, "Email", "email", "work_email")}</strong></div><div><span>Joined</span><strong>{joinedOf(selectedPerson)}</strong></div><div><span>Employee type</span><strong>{get(selectedPerson, "employee_type_display", "employee_type")}</strong></div><div><span>Status</span><strong>{get(selectedPerson, "employee_status_display", "employee_status")}</strong></div><div><span>Reports to</span><strong>{get(selectedPerson, "manager_name", "Manager", "manager", "ReportsTo", "reportsTo", "reporting_manager")}</strong></div></div><div className="ad-person-modal-actions"><button className="secondary-button" onClick={() => { const email = get(selectedPerson, "Email", "email", "work_email"); if (email !== "—") window.location.href = `mailto:${email}`; }}>✉ Send email</button><button className="primary-button" onClick={() => setSelectedPerson(null)}>Done</button></div></section></div>}
  </div>;
}
