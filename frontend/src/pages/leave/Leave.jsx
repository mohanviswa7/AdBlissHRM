import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./module.css";

const initialRequests = [
  { id: 1, type: "Casual Leave", from: "2026-11-12", to: "2026-11-12", days: 1, reason: "Personal work", status: "Pending" },
  { id: 2, type: "Work From Home", from: "2026-10-19", to: "2026-10-19", days: 1, reason: "Focused project work", status: "Approved" },
  { id: 3, type: "Casual Leave", from: "2026-09-04", to: "2026-09-04", days: 1, reason: "Personal appointment", status: "Approved" },
];
const holidays = [ { date: "2026-11-09", name: "Diwali", type: "National Holiday" }, { date: "2026-11-16", name: "Chhath Puja", type: "National Holiday" }, { date: "2026-12-25", name: "Christmas", type: "National Holiday" } ];
const fmt = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const countDays = (from, to) => { if (!from || !to || to < from) return 0; return Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000) + 1; };

export default function Leave() {
  const { data = {}, onAction } = useOutletContext() || {};
  const [tab, setTab] = useState("Hub");
  const [requests, setRequests] = useState(data.leaveRequests || initialRequests);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [from, setFrom] = useState("2026-10-29");
  const [to, setTo] = useState("2026-10-29");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarEvents, setCalendarEvents] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const balances = data.leaveBalances || [
    { type: "Casual Leave", short: "CL", available: 6.5, total: 12, color: "violet", note: "For personal time and recharge" },
    { type: "Earned Leave", short: "EL", available: 8, total: 15, color: "green", note: "Plan longer breaks ahead" },
    { type: "Work From Home", short: "WFH", available: 2.42, total: 90, color: "blue", note: "Flexible work days" },
    { type: "Comp Off", short: "CO", available: 0, total: 0, color: "orange", note: "Earned for eligible extra hours" },
  ];
  const pendingCount = requests.filter((r) => String(r.status).toLowerCase() === "pending").length;
  const selectedDays = countDays(from, to);
  const visibleRequests = useMemo(() => requests.filter((request) => `${request.type} ${request.status} ${request.reason}`.toLowerCase().includes(search.toLowerCase()) && (filter === "All statuses" || request.status === filter)), [requests, search, filter]);
  const submitRequest = (event) => {
    event.preventDefault();
    if (!from || !to || to < from) { setNotice("Please choose a valid date range."); return; }
    if (!reason.trim()) { setNotice("Please add a short reason before submitting."); return; }
    const newRequest = { id: Date.now(), type: leaveType, from, to, days: selectedDays, reason: reason.trim(), status: "Pending" };
    setRequests((items) => [newRequest, ...items]); setReason(""); setNotice("Your leave request has been added and is awaiting manager review."); setTab("Requests");
  };
  const changeMonth = (offset) => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  const calendarDays = useMemo(() => { const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth(), first = new Date(year, month, 1).getDay(), count = new Date(year, month + 1, 0).getDate(); return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]; }, [calendarMonth]);
  const calendarRange = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthText = String(month + 1).padStart(2, "0");
    return {
      from:`${year}-${monthText}-01`,
      to:`${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [calendarMonth]);

  useEffect(() => {
    if (tab !== "Calendar") return undefined;
    const controller = new AbortController();
    const query = new URLSearchParams(calendarRange);
    setCalendarLoading(true);
    setCalendarError("");
    fetch(`/api/leave/calendar?${query}`, {
      credentials:"same-origin",
      headers:{ accept:"application/json" },
      signal:controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `Calendar request failed (${response.status}).`);
        const events = result.data?.events;
        if (!events || typeof events !== "object" || Array.isArray(events)) throw new Error("The leave calendar returned an unexpected response.");
        setCalendarEvents(events);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCalendarError(error.message || "Unable to load the leave calendar.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCalendarLoading(false);
      });
    return () => controller.abort();
  }, [calendarRange, tab]);

  return <div className="ad-leave-page">
    <div className="page-heading ad-leave-heading"><div><div className="eyebrow">PEOPLE OPERATIONS / TIME & ATTENDANCE</div><h1>Make time for what matters. ✳</h1><p>Plan your time away, check your balance, and keep your team in the loop.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => { const rows = [["Type","From","To","Days","Reason","Status"], ...requests.map((r) => [r.type,r.from,r.to,r.days,r.reason,r.status])]; const csv = rows.map((row) => row.map((v) => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"})); const a = document.createElement("a"); a.href=url; a.download="adbliss-leave-requests.csv"; a.click(); URL.revokeObjectURL(url); }}>↓ &nbsp;Export</button><button className="primary-button" onClick={() => { setTab("Hub"); document.getElementById("ad-leave-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>＋ &nbsp;Apply leave</button></div></div>
    <nav className="ad-leave-tabs" aria-label="Leave navigation">{["Hub", "Calendar", "Requests", "My Leave Rules", "Balances", "Accrual History", "Insights"].map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name === "Hub" ? "✦ " : ""}{name}</button>)}</nav>
    {notice && <div className={`ad-leave-notice ${notice.includes("Please") ? "warning" : "success"}`} role="status"><span>{notice.includes("Please") ? "⚠" : "✓"}</span><p>{notice}</p><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
    {tab === "Hub" && <>
      <div className="ad-leave-hub-grid"><div className="ad-leave-left-stack"><section className="ad-leave-balance-hero"><div className="ad-leave-ring" style={{"--progress": `${Math.min(100, (balances.reduce((sum,b)=>sum+Number(b.available||0),0) / Math.max(1,balances.reduce((sum,b)=>sum+Number(b.total||0),0))) * 100)}%`}}><div><strong>{balances.reduce((sum,b)=>sum+Number(b.available||0),0).toFixed(1)}</strong><span>DAYS LEFT</span><small>across balances</small></div></div><div className="ad-leave-hero-copy"><span className="ad-leave-overline">YOUR TIME, YOUR WAY</span><h2>A little breathing room goes a long way.</h2><p>You've taken <strong>{requests.filter((r) => r.status === "Approved").reduce((sum,r)=>sum+Number(r.days||0),0)} days</strong> off in 2026. Make time to reset and come back refreshed.</p><button className="ad-leave-text-button" onClick={() => setTab("Balances")}>Explore balances →</button></div><div className="ad-leave-mini-balance">{balances.slice(0,3).map((b) => <div key={b.type}><span>{b.type}</span><strong>{b.available} <small>days</small></strong><i><b style={{width:`${Math.min(100,Number(b.total)?Number(b.available)/Number(b.total)*100:0)}%`}}/></i></div>)}</div></section>
      <section className="ad-leave-smart-actions"><div className="ad-leave-section-title"><div><h2>Smart actions</h2><p>Make your next step easy.</p></div><button onClick={() => setTab("My Leave Rules")}>Explore rules →</button></div><div className="ad-leave-action-grid"><button onClick={() => document.getElementById("ad-leave-form")?.scrollIntoView({behavior:"smooth",block:"center"})}><span className="lavender">＋</span><strong>Apply leave</strong><small>Guided request form</small></button><button onClick={() => setTab("Calendar")}><span className="blue">▦</span><strong>Plan a break</strong><small>View your calendar</small></button><button onClick={() => {setLeaveType("Comp Off");document.getElementById("ad-leave-form")?.scrollIntoView({behavior:"smooth",block:"center"});}}><span className="peach">ϟ</span><strong>Use comp-off</strong><small>{balances.find((b)=>b.type==="Comp Off")?.available || 0} days available</small></button><button onClick={() => setTab("Balances")}><span className="mint">₹</span><strong>Leave balances</strong><small>See your entitlements</small></button></div></section>
      <section className="ad-leave-form-panel" id="ad-leave-form"><div className="ad-leave-section-title"><div><h2>Apply for myself</h2><p>Submit a request for your manager to review.</p></div><span className="ad-leave-required">* Required fields</span></div><form onSubmit={submitRequest}><label className="ad-leave-field full">Leave type<select value={leaveType} onChange={(e)=>setLeaveType(e.target.value)}>{balances.map((b)=><option key={b.type} value={b.type}>{b.type} — {b.available} days available</option>)}</select></label><div className="ad-leave-form-row"><label className="ad-leave-field">From<input type="date" value={from} onChange={(e)=>{setFrom(e.target.value);if(to<e.target.value)setTo(e.target.value);}} required/></label><label className="ad-leave-field">To<input type="date" min={from} value={to} onChange={(e)=>setTo(e.target.value)} required/></label></div><label className="ad-leave-field full">Reason <span>*</span><textarea value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Briefly tell your manager why you're requesting time off..." rows={3} required maxLength={300}/></label><div className={`ad-leave-form-hint ${reason.trim() && selectedDays > 0 ? "ready" : ""}`}>{selectedDays > 0 ? `ⓘ  ${selectedDays} day${selectedDays===1?"":"s"} selected. ${reason.trim()?"Your request is ready to submit.":"A reason is required before submitting."}` : "⚠  Select a valid date range."}</div><button className="primary-button ad-leave-submit" type="submit">Submit request &nbsp;→</button></form></section></div>
      <aside className="ad-leave-right-stack"><section className="ad-leave-health"><div className="ad-leave-health-ring"><strong>60</strong></div><div><h3>Leave health · Fair</h3><p>You've taken <strong>0 days</strong> in this cycle. Aim for one break every 8 weeks to stay refreshed.</p><small>Last break · {requests.some((r)=>r.status==="Approved")?fmt(requests.find((r)=>r.status==="Approved").from):"None yet"}</small></div></section><section className="ad-leave-upcoming"><div className="ad-leave-section-title"><h2>Upcoming time-off</h2><button onClick={()=>setTab("Calendar")}>Calendar →</button></div>{requests.filter((r)=>r.status==="Approved" && r.from >= "2026-10-29").length ? requests.filter((r)=>r.status==="Approved" && r.from >= "2026-10-29").map((r)=><div className="ad-leave-upcoming-row" key={r.id}><span className="ad-leave-date-tile"><small>{new Date(`${r.from}T12:00:00`).toLocaleDateString("en-IN",{month:"short"})}</small><b>{new Date(`${r.from}T12:00:00`).getDate()}</b></span><div><strong>{r.type}</strong><small>{fmt(r.from)} · {r.days} day(s)</small></div></div>):<div className="ad-leave-empty-upcoming"><span>☁</span><strong>Your next break starts here.</strong><small>Approved upcoming time-off will appear here.</small><button onClick={()=>document.getElementById("ad-leave-form")?.scrollIntoView({behavior:"smooth",block:"center"})}>Plan time off →</button></div>}</section><section className="ad-leave-holidays"><div className="ad-leave-section-title"><h2>Holidays · upcoming</h2><button onClick={()=>setTab("Calendar")}>View calendar →</button></div>{holidays.map((holiday)=><div className="ad-leave-holiday-row" key={holiday.name}><span className="ad-leave-date-tile"><small>{new Date(`${holiday.date}T12:00:00`).toLocaleDateString("en-IN",{month:"short"})}</small><b>{new Date(`${holiday.date}T12:00:00`).getDate()}</b></span><div><strong>{holiday.name}</strong><small>{holiday.type}</small></div></div>)}</section></aside></div>
    </>}
    {tab === "Requests" && <section className="ad-leave-content-panel"><div className="ad-leave-section-title"><div><h2>Your leave requests</h2><p>Review request dates and track approval status.</p></div><button className="primary-button" onClick={()=>setTab("Hub")}>＋ New request</button></div><div className="ad-leave-table-tools"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search leave requests..."/><select value={filter} onChange={(e)=>setFilter(e.target.value)}><option>All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div><RequestTable requests={visibleRequests}/></section>}
    {tab === "Balances" && <section className="ad-leave-content-panel"><div className="ad-leave-section-title"><div><h2>Your leave balances</h2><p>Available entitlement for the current leave cycle.</p></div></div><div className="ad-leave-balance-cards">{balances.map((b)=><article key={b.type} className={`ad-leave-balance-card ${b.color}`}><span>{b.short}</span><h3>{b.type}</h3><strong>{b.available} <small>days left</small></strong><div className="ad-leave-progress"><i style={{width:`${Math.min(100,Number(b.total)?Number(b.available)/Number(b.total)*100:0)}%`}}/></div><p>{b.note}</p><small>{b.total} days total entitlement</small></article>)}</div></section>}
    {tab === "Calendar" && <section className="ad-leave-content-panel">
      <div className="ad-leave-section-title">
        <div><h2>Leave calendar</h2><p>Plan around your requests and upcoming holidays.</p></div>
        <div className="ad-leave-month-control"><button onClick={()=>changeMonth(-1)} aria-label="Previous month">‹</button><strong>{calendarMonth.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</strong><button onClick={()=>changeMonth(1)} aria-label="Next month">›</button></div>
      </div>
      {calendarLoading && <p className="ad-leave-demo-note" role="status">Loading team calendar...</p>}
      {calendarError && <p className="ad-leave-demo-note" role="alert">{calendarError}</p>}
      <div className="ad-leave-calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day)=><b key={day}>{day}</b>)}
        {calendarDays.map((day,index)=>{
          const date=day?`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`:"";
          const events=date && Array.isArray(calendarEvents[date]) ? calendarEvents[date] : [];
          const hasHoliday=events.some((event)=>String(event.kind||"").toLowerCase()==="holiday");
          const hasLeave=events.some((event)=>String(event.kind||"").toLowerCase().includes("leave"));
          return <div key={`${date||"blank"}-${index}`} className={`ad-leave-calendar-day ${!day?"blank":""} ${hasHoliday?"holiday":""} ${hasLeave?"approved":""}`}>
            <span>{day||""}</span>
            {events.map((event,eventIndex)=><small key={`${event.kind||"event"}-${event.label||eventIndex}`}>{event.label||event.kind||"Event"}</small>)}
          </div>;
        })}
      </div>
      <div className="ad-leave-calendar-legend"><span><i className="holiday-dot"/> Holiday</span><span><i className="approved-dot"/> Leave</span></div>
    </section>}
    {tab === "My Leave Rules" && <section className="ad-leave-content-panel"><div className="ad-leave-section-title"><div><h2>My leave rules</h2><p>A quick guide to the policies that shape your time off.</p></div></div><div className="ad-leave-rules-grid"><article><span>01</span><h3>Plan ahead</h3><p>Submit leave requests as early as possible so your team can plan coverage.</p></article><article><span>02</span><h3>Manager approval</h3><p>Requests remain pending until reviewed. Check the Requests tab for status changes.</p></article><article><span>03</span><h3>Give a clear reason</h3><p>Add a short note so your manager understands the request and can respond quickly.</p></article><article><span>04</span><h3>Check your balance</h3><p>Review the Balances tab before applying. Entitlements depend on company policy.</p></article></div><p className="ad-leave-demo-note">These are general guidance notes. Connect your company's HR policy API to show official Adbliss leave rules.</p></section>}
    {tab === "Accrual History" && <section className="ad-leave-content-panel"><div className="ad-leave-section-title"><div><h2>Accrual history</h2><p>See how your leave balance has changed over time.</p></div></div><div className="ad-leave-timeline">{[{date:"01 Oct 2026",title:"Monthly leave accrual",detail:"Current cycle balance refreshed",amount:"+1.00 day"},{date:"01 Sep 2026",title:"Monthly leave accrual",detail:"Monthly entitlement credited",amount:"+1.00 day"},{date:"01 Aug 2026",title:"Monthly leave accrual",detail:"Monthly entitlement credited",amount:"+1.00 day"}].map((item)=><div key={item.date}><i/><small>{item.date}</small><section><strong>{item.title}</strong><p>{item.detail}</p></section><b>{item.amount}</b></div>)}</div><p className="ad-leave-demo-note">Sample activity for layout preview. Real accrual events should come from the leave management API.</p></section>}
    {tab === "Insights" && <section className="ad-leave-content-panel"><div className="ad-leave-section-title"><div><h2>Your time-off insights</h2><p>A simple view of how you're using your leave.</p></div></div><div className="ad-leave-insight-grid"><article><small>REQUESTS THIS YEAR</small><strong>{requests.length}</strong><p>All submitted requests</p></article><article><small>APPROVED DAYS</small><strong>{requests.filter(r=>r.status==="Approved").reduce((sum,r)=>sum+Number(r.days||0),0)}</strong><p>Days away approved</p></article><article><small>AWAITING REVIEW</small><strong>{pendingCount}</strong><p>Requests pending a decision</p></article></div><div className="ad-leave-insight-message"><span>✦</span><div><strong>Rest is part of doing great work.</strong><p>Look ahead at your calendar and plan time away that works for you and your team.</p><button onClick={()=>setTab("Calendar")}>Plan your next break →</button></div></div></section>}
  </div>;
}

function RequestTable({ requests }) {
  if (!requests.length) return <div className="ad-leave-no-results"><span>▦</span><strong>No matching requests</strong><p>Try changing the search or status filter.</p></div>;
  return <div className="ad-leave-table-wrap"><table className="ad-leave-table"><thead><tr><th>Leave type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead><tbody>{requests.map((r)=><tr key={r.id}><td><strong>{r.type}</strong></td><td>{fmt(r.from)}</td><td>{fmt(r.to)}</td><td>{r.days}</td><td>{r.reason}</td><td><span className={`ad-leave-status ${String(r.status).toLowerCase()}`}>{r.status}</span></td></tr>)}</tbody></table></div>;
}
