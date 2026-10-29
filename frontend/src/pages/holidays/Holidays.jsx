import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./module.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (value) => String(value).padStart(2, "0");
const isoDate = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

export default function Holidays() {
  const { data } = useOutletContext();
  const now = new Date();
  const [view, setView] = useState({ year:now.getFullYear(), month:now.getMonth() });
  const holidays = data?.data?.events?.holidays || [];
  const todayKey = isoDate(now.getFullYear(), now.getMonth(), now.getDate());

  const byDate = useMemo(() => {
    const map = new Map();
    for (const holiday of holidays) map.set(holiday.date, holiday);
    return map;
  }, [holidays]);

  const monthLabel = new Intl.DateTimeFormat("en-IN", { month:"long", year:"numeric" })
    .format(new Date(view.year, view.month, 1));
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length:daysInMonth }, (_, index) => index + 1),
  ];
  const monthPrefix = `${view.year}-${pad(view.month + 1)}-`;
  const monthHolidays = holidays.filter((holiday) => holiday.date.startsWith(monthPrefix));

  function move(step) {
    const next = new Date(view.year, view.month + step, 1);
    setView({ year:next.getFullYear(), month:next.getMonth() });
  }

  return (
    <div className="holiday-calendar">
      <section className="holiday-calendar-card">
        <header className="holiday-calendar-header">
          <button type="button" onClick={() => move(-1)} aria-label="Previous month">‹</button>
          <h2>{monthLabel}</h2>
          <button type="button" onClick={() => move(1)} aria-label="Next month">›</button>
          <button type="button" className="holiday-today" onClick={() => setView({ year:now.getFullYear(), month:now.getMonth() })}>
            Today
          </button>
        </header>
        <div className="holiday-grid">
          {weekdays.map((day) => <div className="holiday-weekday" key={day}>{day}</div>)}
          {cells.map((day, index) => {
            if (!day) return <div className="holiday-cell empty" key={`empty-${index}`} />;
            const key = isoDate(view.year, view.month, day);
            const holiday = byDate.get(key);
            const classes = ["holiday-cell", holiday && "is-holiday", key === todayKey && "is-today"].filter(Boolean).join(" ");
            return (
              <div className={classes} key={key} title={holiday?.title}>
                <span>{day}</span>
                {holiday && <small>{holiday.title}</small>}
              </div>
            );
          })}
        </div>
      </section>

      <aside className="holiday-calendar-list">
        <h3>Holidays in {monthLabel}</h3>
        {monthHolidays.length === 0 && <p>No holidays this month.</p>}
        {monthHolidays.map((holiday) => {
          const date = new Date(`${holiday.date}T00:00:00`);
          return (
            <div className="holiday-list-row" key={holiday.date}>
              <b>{date.getDate()}</b>
              <div>
                <strong>{holiday.title}</strong>
                <small>
                  {new Intl.DateTimeFormat("en-IN", { weekday:"long" }).format(date)}
                  {holiday.is_optional ? " · Optional" : ""}
                </small>
              </div>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
