import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./module.css";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const pad = (value) => String(value).padStart(2, "0");
const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromKey = (key) => new Date(`${key}T00:00:00`);
const longDate = (date) => `${date.getDate()} ${new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date)} ${date.getFullYear()}, ${new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date)}`;

// Monday-first grid that includes the trailing/leading days of neighbouring months.
function monthCells(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const total = Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7) * 7;
  return Array.from({ length: total }, (_, index) => new Date(year, month, 1 - offset + index));
}

export default function Holidays() {
  const { data } = useOutletContext();
  const today = new Date();
  const todayKey = keyOf(today);
  const [tab, setTab] = useState("My Calendar");
  const [mode, setMode] = useState("Month");
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(todayKey);

  const holidays = data?.data?.events?.holidays || [];
  const byDate = useMemo(() => new Map(holidays.map((holiday) => [holiday.date, holiday])), [holidays]);
  const sorted = useMemo(() => [...holidays].sort((a, b) => a.date.localeCompare(b.date)), [holidays]);
  const selectedHoliday = byDate.get(selected);
  const selectedDate = fromKey(selected);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const title = mode === "Year" ? String(year) : mode === "Day" ? longDate(selectedDate) : new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(cursor);

  function move(step) {
    if (mode === "Year") setCursor(new Date(year + step, month, 1));
    else if (mode === "Day") {
      const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + step);
      setSelected(keyOf(next));
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    } else setCursor(new Date(year, month + step, 1));
  }

  function goToday() {
    setSelected(todayKey);
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const details = (
    <aside className="hc-details">
      <span className="hc-details-label">DETAILS</span>
      <h3>{longDate(selectedDate)}</h3>
      {selectedHoliday ? (
        <div className="hc-details-item">
          <span className="hc-pill">{selectedHoliday.title}</span>
          <small>{selectedHoliday.is_optional ? "Optional holiday" : "Company holiday"}</small>
        </div>
      ) : (
        <div className="hc-empty"><span>▦</span><strong>Nothing on this day</strong></div>
      )}
    </aside>
  );

  return (
    <div className="hc-page">
      <header className="hc-head">
        <h1>Holiday Calendar</h1>
        <p>Your holidays, leave and long weekends</p>
      </header>

      <nav className="hc-tabs" aria-label="Holiday views">
        <button type="button" className={tab === "My Calendar" ? "active" : ""} onClick={() => setTab("My Calendar")}>My Calendar</button>
        <button type="button" className={tab === "My Holidays" ? "active" : ""} onClick={() => setTab("My Holidays")}>My Holidays <b>{holidays.length}</b></button>
      </nav>

      <div className="hc-showing">Showing: <strong>Corporate Office</strong></div>

      {tab === "My Holidays" ? (
        <section className="hc-list">
          {sorted.length === 0 && <p className="hc-muted">No holidays have been published yet.</p>}
          {sorted.map((holiday) => {
            const date = fromKey(holiday.date);
            return (
              <button type="button" className="hc-list-row" key={holiday.date} onClick={() => { setTab("My Calendar"); setMode("Month"); setSelected(holiday.date); setCursor(new Date(date.getFullYear(), date.getMonth(), 1)); }}>
                <b>{date.getDate()}</b>
                <div><strong>{holiday.title}</strong><small>{new Intl.DateTimeFormat("en-IN", { weekday: "long", month: "long", year: "numeric" }).format(date)}{holiday.is_optional ? " · Optional" : ""}</small></div>
              </button>
            );
          })}
        </section>
      ) : (
        <>
          <div className="hc-toolbar">
            <div className="hc-nav">
              <button type="button" onClick={() => move(-1)} aria-label="Previous">‹</button>
              <strong>{title}</strong>
              <button type="button" onClick={() => move(1)} aria-label="Next">›</button>
              <button type="button" className="hc-today" onClick={goToday}>Today</button>
            </div>
            <div className="hc-modes">
              {["Month", "Day", "Year"].map((item) => <button type="button" key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}
            </div>
          </div>

          <div className="hc-legend">
            <span className="hc-chip"><i className="holiday" /> Holiday</span>
            <span className="hc-chip"><i className="optional" /> Optional Holiday</span>
            <em>Week starts Monday</em>
          </div>

          <div className="hc-body">
            {mode === "Month" && (
              <section className="hc-grid-card">
                <div className="hc-grid">
                  {weekdays.map((day) => <div className="hc-weekday" key={day}>{day.toUpperCase()}</div>)}
                  {monthCells(year, month).map((date) => {
                    const key = keyOf(date);
                    const holiday = byDate.get(key);
                    const classes = ["hc-cell", date.getMonth() !== month && "outside", [0, 6].includes(date.getDay()) && "weekend", key === selected && "selected", key === todayKey && "today"].filter(Boolean).join(" ");
                    return (
                      <button type="button" className={classes} key={key} onClick={() => setSelected(key)}>
                        <span>{date.getDate()}</span>
                        {holiday && <em className={holiday.is_optional ? "optional" : ""}>{holiday.title}</em>}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {mode === "Year" && (
              <section className="hc-year">
                {Array.from({ length: 12 }, (_, index) => (
                  <div className="hc-mini" key={index}>
                    <button type="button" className="hc-mini-title" onClick={() => { setCursor(new Date(year, index, 1)); setMode("Month"); }}>
                      {new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(year, index, 1))}
                    </button>
                    <div className="hc-mini-grid">
                      {monthCells(year, index).map((date) => {
                        const key = keyOf(date);
                        const inMonth = date.getMonth() === index;
                        return <span key={key} className={[!inMonth && "outside", inMonth && byDate.has(key) && "holiday", key === todayKey && "today"].filter(Boolean).join(" ")} title={byDate.get(key)?.title}>{date.getDate()}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {mode === "Day" && (
              <section className="hc-grid-card hc-day">
                <h2>{longDate(selectedDate)}</h2>
                {selectedHoliday ? <span className="hc-pill big">{selectedHoliday.title}</span> : <div className="hc-empty"><span>▦</span><strong>Nothing on this day</strong></div>}
              </section>
            )}

            {mode !== "Day" && details}
            {mode === "Day" && details}
          </div>
        </>
      )}

      <footer className="hc-footer">© AdblissHRM {today.getFullYear()}</footer>
    </div>
  );
}
