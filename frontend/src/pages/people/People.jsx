import { useEffect, useMemo, useState } from "react";
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

const findList = (source, pattern, depth = 0) => {
  if (!source || typeof source !== "object" || depth > 4) return null;
  for (const [key, value] of Object.entries(source)) {
    if (pattern.test(key) && Array.isArray(value)) return value;
  }
  for (const value of Object.values(source)) {
    const found = findList(value, pattern, depth + 1);
    if (found) return found;
  }
  return null;
};
const toJoiner = (person) => ({ name: fullName(person), subtitle: roleOf(person) !== "—" ? roleOf(person) : teamOf(person) !== "—" ? teamOf(person) : "—", person });
const toCelebration = (entry) => {
  const type = String(get(entry, "type", "event", "event_type", "kind")).toLowerCase();
  const years = get(entry, "years", "year", "tenure");
  const anniversary = type.includes("anniv") || (years !== "—" && type === "—");
  const label = type === "—" && years === "—" ? "Celebration" : anniversary ? `${years !== "—" ? `${years}-yr ` : ""}work anniversary` : "Birthday";
  return { name: fullName(entry), icon: anniversary ? "🎉" : "🎂", label, person: entry };
};
const avatarTones = ["teal", "green", "blue", "orange"];

function NotablePanel({ icon, title, items, empty }) {
  return <section className="ad-notable-panel">
    <h2><span>{icon}</span> {title}</h2>
    {items.length ? items.map((item, index) => <article className="ad-notable-row" key={`${item.name}-${index}`}>
      <span className={`ad-notable-avatar ${avatarTones[index % avatarTones.length]}`}>{item.photo ? <img src={item.photo} alt="" /> : item.initials}</span>
      <div><strong>{item.name}</strong><small>{item.icon ? `${item.icon} ` : ""}{item.subtitle}</small></div>
      {item.action && <button className="ad-notable-hi" onClick={item.action}>👋 Hi</button>}
    </article>) : <p className="ad-notable-empty">{empty}</p>}
  </section>;
}

export default function People() {
  const { data = {}, onAction } = useOutletContext() || {};
  const peopleOverview = useSelector((state) => state.hrm.peopleOverview);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [view, setView] = useState("Discover");
  const [events, setEvents] = useState(null);
  useEffect(() => {
    if (view !== "New & Notable" || events) return undefined;
    const controller = new AbortController();
    fetch("/api/dashboard/attendance-birthday-anniversaries-holidays", { credentials: "same-origin", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => setEvents(result?.data?.events || { birthdays: [], anniversaries: [] }))
      .catch(() => {});
    return () => controller.abort();
  }, [view, events]);
  const peopleSource = Array.isArray(data.records) ? data.records : [];
  const departments = useMemo(() => ["All", ...new Set(peopleSource.map(teamOf).filter((team) => team !== "—" && team !== "Unassigned"))], [peopleSource]);
  const people = useMemo(() => peopleSource.filter((person) => {
    const searchText = [fullName(person), roleOf(person), teamOf(person), get(person, "Location", "location", "Office", "office", "work_location"), get(person, "Email", "email", "work_email")].join(" ").toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase().trim());
    const matchesDepartment = department === "All" || teamOf(person) === department;
    return matchesQuery && matchesDepartment;
  }), [peopleSource, query, department]);

  const initialsOfName = (name) => String(name).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const joinerItems = useMemo(() => {
    const overviewList = findList(peopleOverview.data, /new.?joiner|joiner/i);
    const entries = overviewList || [...peopleSource].sort((a, b) => (Date.parse(joinedOf(b)) || 0) - (Date.parse(joinedOf(a)) || 0)).slice(0, 6);
    return entries.map(toJoiner).map((item) => ({
      ...item,
      initials: initialsOfName(item.name),
      photo: photoOf(item.person) !== "—" ? photoOf(item.person) : "",
      action: () => setSelectedPerson(item.person),
    }));
  }, [peopleOverview.data, peopleSource]);
  const celebrationItems = useMemo(() => {
    const overviewList = findList(peopleOverview.data, /celebration|birthday|anniversar/i);
    let entries = overviewList?.map(toCelebration);
    if (!entries?.length && events) {
      entries = [
        ...(events.birthdays || []).filter((entry) => entry.in_days <= 7).map((entry) => ({ name: entry.name.trim(), icon: "🎂", label: "Birthday", person: entry, photo: entry.logo })),
        ...(events.anniversaries || []).filter((entry) => entry.in_days <= 7).map((entry) => ({ name: entry.name.trim(), icon: "🎉", label: `${entry.years}-yr work anniversary`, person: entry, photo: entry.logo })),
      ];
    }
    return (entries || []).map((item) => ({
      name: item.name, subtitle: item.label, icon: item.icon,
      initials: initialsOfName(item.name),
      photo: item.photo || (photoOf(item.person) !== "—" ? photoOf(item.person) : ""),
    }));
  }, [peopleOverview.data, events]);


  return <div className="ad-people-page">
    <header className="ad-people-heading">
      <div className="ad-people-title"><h1>People · <span>{view}</span></h1><p>· Find colleagues · share work · build network</p></div>
      <div className="ad-people-actions"><button className="people-action-edit" onClick={() => onAction?.("profile")}>✎ Edit profile</button><button className="people-action-connect" onClick={() => onAction?.("module-action")}>☁ Konnect</button></div>
    </header>

    <nav className="ad-people-tabs" aria-label="People views">{["Discover", "New & Notable"].map((tab) => <button key={tab} className={view === tab ? "active" : ""} onClick={() => setView(tab)}>{tab}</button>)}</nav>

    {view === "New & Notable" ? <div className="ad-notable-grid">
      <NotablePanel icon="🌱" title="New Joiners · last 30d" items={joinerItems} empty="No new joiners yet." />
      <NotablePanel icon="🎉" title="This Week's Celebrations" items={celebrationItems} empty="No celebrations this week." />
    </div> : <>
    <label className="people-search"><span className="people-search-icon">✦</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find anyone · name, department, location..."/><kbd>⌘K</kbd>{query && <button className="ad-people-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>

    <div className="ad-people-quick-links">
      <button className="ad-people-quick-card" onClick={() => { setView("New & Notable"); setDepartment("All"); setQuery(""); }}><span className="ad-people-quick-icon green">🌱</span><strong>New Joiners</strong><small>last 30 days</small></button>
      <button className="ad-people-quick-card" onClick={() => { setView("New & Notable"); setDepartment("All"); setQuery(""); }}><span className="ad-people-quick-icon pink">🎉</span><strong>Celebrations</strong><small>this week</small></button>
    </div>

    <div className="people-department-bar" aria-label="Filter by department">{departments.map((name) => <button key={name} className={`department-chip ${department === name ? "selected" : ""}`} onClick={() => setDepartment(name)}>{name === "All" ? "All" : name}</button>)}</div>


    { data.source === "kredily" ? <div className="ad-people-api-status">Connected to the employee directory {data.count ?? peopleSource.length} employee records loaded</div> : null}
    {peopleOverview.data ? <div className="ad-people-api-status">Kredily overview data loaded successfully.</div> : null}
    <div className="people-grid">
      {people.map((person, index) => {
        const name = fullName(person); const photo = photoOf(person); const location = locationOf(person); const duration = yearsAtCompany(person);
        return <article className="ad-person-card" key={employeeIdOf(person) !== "—" ? employeeIdOf(person) : `${name}-${index}`} onClick={() => setSelectedPerson(person)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelectedPerson(person); }}>
          <div className={`person-portrait ${person.color || ["avatar-violet", "avatar-blue", "avatar-green", "avatar-rose", "avatar-gold"][index % 5]}`}>{photo !== "—" ? <img src={photo} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>{initialsFor(person)}</span>}<i className="person-presence-dot" /></div>
          <h2>{name}</h2><p>{roleOf(person)}{teamOf(person) !== "—" ? ` · ${teamOf(person)}` : ""}</p>
          <div className="ad-person-card-meta"><span>{location !== "—" ? location : "Office not specified"}</span>{duration && <><i>•</i><span>{duration}</span></>}</div>
          <div className="ad-person-card-actions"><button aria-label={`Message ${name}`} title="Message" onClick={(event) => { event.stopPropagation(); const email = get(person, "Email", "email", "work_email"); if (email !== "—") window.location.href = `mailto:${email}`; else setSelectedPerson(person); }}>💬</button><button aria-label={`View ${name} profile`} title="View profile" onClick={(event) => { event.stopPropagation(); setSelectedPerson(person); }}>↗</button></div>
        </article>;
      })}
    </div> 

    {!people.length && <div className="people-empty-state"><strong>{peopleSource.length ? "No employees match your filters" : "Employee directory is not connected yet"}</strong><p>{peopleSource.length ? "Try another name or department." : "Once the Kredily API credentials are configured on the backend, employee records will appear here automatically."}</p>{(query || department !== "All") && <button onClick={() => { setQuery(""); setDepartment("All"); setView("Discover"); }}>Clear filters</button>}</div>}

    </>}

    {selectedPerson && <div className="ad-person-modal-backdrop" role="presentation" onClick={() => setSelectedPerson(null)}><section className="ad-person-modal" role="dialog" aria-modal="true" aria-label={`${fullName(selectedPerson)} profile`} onClick={(event) => event.stopPropagation()}><button className="ad-person-modal-close" onClick={() => setSelectedPerson(null)} aria-label="Close profile">×</button><div className={`person-portrait ${selectedPerson.color || "avatar-violet"}`}>{photoOf(selectedPerson) !== "—" ? <img src={photoOf(selectedPerson)} alt={fullName(selectedPerson)} /> : initialsFor(selectedPerson)}</div><span className="ad-person-modal-eyebrow">EMPLOYEE PROFILE</span><h2>{fullName(selectedPerson)}</h2><p className="ad-person-modal-role">{roleOf(selectedPerson)} · {teamOf(selectedPerson)}</p><div className="ad-person-detail-list"><div><span>Employee ID</span><strong>{employeeIdOf(selectedPerson)}</strong></div><div><span>Work location</span><strong>{locationOf(selectedPerson)}</strong></div><div><span>Work email</span><strong>{get(selectedPerson, "Email", "email", "work_email")}</strong></div><div><span>Joined</span><strong>{joinedOf(selectedPerson)}</strong></div><div><span>Employee type</span><strong>{get(selectedPerson, "employee_type_display", "employee_type")}</strong></div><div><span>Status</span><strong>{get(selectedPerson, "employee_status_display", "employee_status")}</strong></div><div><span>Reports to</span><strong>{get(selectedPerson, "manager_name", "Manager", "manager", "ReportsTo", "reportsTo", "reporting_manager")}</strong></div></div><div className="ad-person-modal-actions"><button className="secondary-button" onClick={() => { const email = get(selectedPerson, "Email", "email", "work_email"); if (email !== "—") window.location.href = `mailto:${email}`; }}>✉ Send email</button><button className="primary-button" onClick={() => setSelectedPerson(null)}>Done</button></div></section></div>}
  </div>;
}
