import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MetricGrid, DataTable } from "../../components/PagePrimitives.jsx";

const shortcuts = [
  ["People","/people","♧","#f1efff"],["ID card","/id-card","▣","#eef6ff"],["Timesheet","/timesheet","◷","#e9f8f2"],
  ["Attendance","/attendance","◴","#fff4e5"],["Leave","/leave","✳","#fff0f2"],["Payroll","/payroll","₹","#f4efff"],
  ["Expenses","/expenses","↗","#fff4e5"],["Goals","/performance","✧","#fff0f2"],["Documents","/documents","▤","#eef6ff"],["Benefits","/insurance","♡","#e9f8f2"],
];

export default function Dashboard() {
  const { data = {}, onAction, quickLinks = [], clockedIn } = useOutletContext();
  const [elapsed, setElapsed] = useState(6 * 3600 + 58 * 60 + 33);
  useEffect(() => {
    if (!clockedIn) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [clockedIn]);
  const visibleShortcuts = quickLinks.length ? shortcuts.filter(([name,path]) => quickLinks.some((id) => path === `/${id}`)) : shortcuts;
  return <>
    <div className="page-heading"><div><div className="eyebrow">WEDNESDAY, 28 OCTOBER 2026 · YOUR KREDILY WORKSPACE</div><h1>Good afternoon, Mohan <span>👋</span></h1><p>Good things happen when people feel at home. Here's what's happening across yours.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => onAction("calendar")}>▦ &nbsp; Calendar</button></div></div>
    <MetricGrid metrics={data.metrics || []} />
    <div className="dashboard-grid"><div className="dashboard-left">
      <section className="welcome-banner"><div className="eyebrow">YOUR DAY, YOUR WAY</div><h2>Make today a good one.</h2><p>Your people, progress and plans are all right here. Take a look around.</p><Link className="primary-button" to="/people">Meet your team &nbsp;→</Link><div className="welcome-art" aria-hidden="true">✦</div></section>
      <section className="panel content-panel"><div className="section-title"><div><h2>Your shortcuts</h2><p>The things you reach for, right at your fingertips.</p></div><button className="soft-button" onClick={() => onAction("customize")}>Customize</button></div><div className="quick-grid">{visibleShortcuts.map(([name,path,icon,tint]) => <Link className="quick-card" to={path} key={path}><span className="quick-icon" style={{"--tile":tint}}>{icon}</span>{name}</Link>)}</div></section>
      <section className="panel attendance-preview"><div className="section-title"><div><h2>Today, so far</h2><p>A little check-in on how your week is going.</p></div><Link className="soft-button" to="/attendance">Attendance →</Link></div><DataTable headers={["Date","Check in","Check out","Hours","Status"]} rows={data.attendance || []} /></section>
    </div><aside className="dashboard-right">
      <section className="clock-widget"><div className="clock-widget-top"><span>◷ &nbsp; YOUR WORK HOURS</span><span className="clock-live">● LIVE</span></div><div className="clock-time">{`${String(Math.floor(elapsed/3600)).padStart(2,"0")}:${String(Math.floor(elapsed%3600/60)).padStart(2,"0")}:${String(elapsed%60).padStart(2,"0")}`}</div><div className="clock-caption">{clockedIn ? "Your day is underway — welcome back!" : "You're clocked out for today."}</div><button className={`clock-button ${clockedIn?"out":""}`} onClick={() => onAction("clock")}><span>{clockedIn?"Clock out":"Clock in"}</span> &nbsp;●</button><div className="clock-meta"><span>Started 09:02 AM</span><span>Goal 8 hours</span></div></section>
      <section className="panel feed-panel"><div className="section-title"><div><h2>Around the team</h2><p>Good things worth a little cheer.</p></div><a className="soft-button" href="/connect">See all</a></div><div className="feed-item"><span className="feed-symbol">🎂</span><div><strong>It's Dipti's birthday today!</strong><p>Send a little love to Dipti Narayan</p></div></div><div className="feed-item"><span className="feed-symbol">🎉</span><div><strong>A warm welcome to our new teammates</strong><p>There are 6 new faces this month</p></div></div></section>
      <section className="panel team-panel"><div className="section-title"><div><h2>Coming up</h2><p>People worth celebrating.</p></div><a className="soft-button" href="/people">View team</a></div><div className="team-list">{(data.birthdays || []).map((person) => <div className="team-row" key={person.Name}><span className={`avatar ${person.color}`}>{person.Initials}</span><div><strong>{person.Name}</strong><small>{person.role}</small></div><span className="right-note">{person.date}</span></div>)}</div></section>
    </aside></div>
  </>;
}
