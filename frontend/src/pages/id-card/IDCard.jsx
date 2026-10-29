import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./module.css";

const first = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

function Brand({ compact = false }) {
  return <div className={`sc1-brand ${compact ? "sc1-brand-compact" : ""}`} aria-label="Adbliss Digital Media">
    <span className="sc1-brand-mark">A</span>
    <span className="sc1-brand-word">ADBLISS<small>DIGITAL MEDIA</small></span>
  </div>;
}

function QRPattern() {
  return <div className="sc1-qr" aria-label="QR code placeholder" role="img">
    {Array.from({ length: 81 }, (_, i) => <i key={i} className={(i % 9 < 3 && Math.floor(i / 9) < 3) || (i % 9 > 5 && Math.floor(i / 9) < 3) || (i % 9 < 3 && Math.floor(i / 9) > 5) || ((i * 7 + Math.floor(i / 9) * 3) % 5 < 2) ? "on" : ""} />)}
    <b className="sc1-finder sc1-finder-a" /><b className="sc1-finder sc1-finder-b" /><b className="sc1-finder sc1-finder-c" />
  </div>;
}

export default function IDCard() {
  const { data = {} } = useOutletContext() || {};
  const person = data.profile || {};
  return <>
    <div className="page-heading"><div><div className="eyebrow">MY PROFILE / EMPLOYEE ID</div><h1>Your work identity.</h1><p>One little card, all the places you belong. Your digital ID is ready whenever you are.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => onAction("share-id")}>↗ &nbsp;Share</button><button className="primary-button" onClick={() => onAction("module-action")}>↓ &nbsp;Download ID</button></div></div>
    <MetricGrid metrics={data.metrics || []} />
    <div className="id-layout"><div className="id-card-column"><article className="id-card">
      <div className="id-card-glow" /><div className="id-card-header"><span className="id-brand">ADBLISSHRM</span><span className="id-label">PEOPLE FIRST <b>✦</b></span></div>
      <div className="id-profile"><div className={`id-avatar ${person.color || "avatar-mohan"}`}>{person.Initials || "MK"}<span>✓</span></div><div className="id-person-copy"><span className="id-status"><i /> ACTIVE TEAMMATE</span><h2>{person.Name || "Mohan Kumar"}</h2><p>{person.Role || "Full Stack Developer"}</p></div></div>
      <div className="id-card-rule" /><div className="id-details"><div><small>EMPLOYEE ID</small><strong>{person.EmployeeID || "KR-2048"}</strong></div><div><small>TEAM</small><strong>{person.Department || "Information Technology"}</strong></div><div><small>WORK LOCATION</small><strong>{person.Location || "Bengaluru, India"}</strong></div><div><small>JOINED OUR STORY</small><strong>{person.Joined || "January 2024"}</strong></div></div>
      <div className="id-card-footer"><span>{person.Email || "mohan.kumar@adblisshrm.com"}</span><div className="fake-qr" aria-label="Employee identity code"><i /><i /><i /><b /></div></div>
    </article><p className="id-card-caption"><span>✦</span> YOUR ADBLISSHRM ID · A LITTLE PROOF YOU BELONG HERE</p></div>
    <aside className="id-side-column"><section className="panel id-info-panel"><span className="id-info-icon">✧</span><h2>Made for your workday.</h2><p>Use your digital ID to check in at the office, connect with teammates and keep your work details close.</p><div className="id-info-row"><span>✉</span><div><small>WORK EMAIL</small><strong>{person.Email || "mohan.kumar@adblisshrm.com"}</strong></div></div><div className="id-info-row"><span>♧</span><div><small>REPORTS TO</small><strong>{person.Manager || "Shailendra Kumar"}</strong></div></div><div className="id-info-row"><span>♡</span><div><small>PEOPLE SINCE</small><strong>{person.Joined || "January 2024"}</strong></div></div><button className="soft-button" onClick={() => onAction("profile")}>View my full profile &nbsp;→</button></section>
      <section className="id-security-note"><span>🔒</span><p><strong>Just for you.</strong> Your employee details are private to your workspace. Share your ID only with people you trust.</p></section></aside></div>
  </>;
}
