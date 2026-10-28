import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

const departments = ["All people","Engineering","Design","People","Finance","Marketing","Customer Success"];

export default function People() {
  const { data = {}, onAction, openPerson } = useOutletContext();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All people");
  const people = useMemo(() => (data.records || []).filter((person) => `${person.Name} ${person.Role} ${person.Department} ${person.Location}`.toLowerCase().includes(query.toLowerCase()) && (department === "All people" || person.Department === department)), [data.records, department, query]);
  return <>
    <div className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS / YOUR TEAM</div><h1>People, at their best. <span>✦</span></h1><p>Our favourite work happens when we know each other. Meet the people behind it.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => onAction("export")}>↓ &nbsp;Export</button><button className="primary-button" onClick={() => onAction("module-action")}>＋ &nbsp;Invite someone</button></div></div>
    <div className="people-banner"><div><span className="people-banner-kicker">GOOD WORK STARTS WITH GOOD PEOPLE</span><h2>Find your people.</h2><p>Say hello, find a teammate, or just see who's making things happen.</p></div><div className="people-banner-art"><span>✦</span><b>☺</b><i>✧</i></div></div>
    <div className="people-toolbar"><label className="people-search">⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a name, role or team..." /></label><div className="people-departments">{departments.map((name) => <button key={name} className={`department-chip ${department===name?"selected":""}`} onClick={() => setDepartment(name)}>{name}</button>)}</div></div>
    <div className="people-summary"><strong>{people.length} good humans</strong><span> across our teams <i>·</i> All are right where they belong.</span></div>
    <div className="people-grid">{people.map((person) => <article className="person-card" key={person.EmployeeID || person.Name}>
      <div className="person-card-top"><span className="person-presence"><i /> Around today</span><button className="person-more" onClick={() => openPerson(person)} aria-label={`View ${person.Name}`}>•••</button></div>
      <div className={`person-portrait ${person.color || "avatar-blue"}`}>{person.Initials || person.Name.split(" ").map((part) => part[0]).join("").slice(0,2)}<span className="portrait-spark">✦</span></div><h2>{person.Name}</h2><p>{person.Role}</p><span className="person-team">{person.Department}</span>
      <div className="person-card-bottom"><span>⌖ &nbsp;{person.Location}</span><button onClick={() => openPerson(person)}>Say hello &nbsp;↗</button></div>
    </article>)}</div>
    {!people.length && <div className="empty-state"><span>♧</span><strong>No teammates match just yet</strong><p>Try a different name, role or department.</p></div>}
  </>;
}
