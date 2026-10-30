import { useOutletContext } from "react-router-dom";
import "./module.css";
import { MetricGrid } from "../../components/PagePrimitives.jsx";

export default function IDCard() {
  const { data = {}, onAction = () => {} } = useOutletContext() || {};
  const person = data.profile || {};
  return <div className="id-page">
    <div className="page-heading">
      <div>
        <div className="eyebrow">MY PROFILE / EMPLOYEE ID</div>
        <h1>Your work identity.</h1>
        <p>One little card, all the places you belong. Your digital ID is ready whenever you are.</p>
      </div>
      <div className="heading-actions">
        <button className="secondary-button" onClick={() => onAction("share-id")}>↗ &nbsp;Share</button>
        <button className="primary-button" onClick={() => onAction("module-action")}>↓ &nbsp;Download ID</button>
      </div>
    </div>
    <MetricGrid metrics={data.metrics || []} />
    <div className="id-layout">
      <div className="id-card-column">
        <article className="id-card">
          <div className="id-card-glow" />
          <div className="id-card-header">
            <span className="id-brand"><span className="id-brand-mark">A</span> ADBLISS HRM</span>
            <span className="id-label">PEOPLE FIRST <b>✦</b></span>
          </div>
          <div className="id-profile">
            <div className={`id-avatar ${person.color || "avatar-mohan"}`}>
              {person.Initials || "—"}<span>✓</span>
            </div>
            <div className="id-person-copy">
              <span className="id-status"><i /> ACTIVE TEAMMATE</span>
              <h2>{person.Name || "—"}</h2>
              <p>{person.Role || "—"}</p>
            </div>
          </div>
          <div className="id-card-rule" />
          <div className="id-details">
            <div><small>EMPLOYEE ID</small><strong>{person.EmployeeID || "—"}</strong></div>
            <div><small>TEAM</small><strong>{person.Department || "—"}</strong></div>
            <div><small>WORK LOCATION</small><strong>{person.Location || "—"}</strong></div>
            <div><small>JOINED OUR STORY</small><strong>{person.Joined || "—"}</strong></div>
          </div>
          <div className="id-card-footer">
            <span>{person.Email || "—"}</span>
          </div>
        </article>
        <p className="id-card-caption"><span>✦</span> YOUR ADBLISSHRM ID · A LITTLE PROOF YOU BELONG HERE</p>
      </div>
      <aside className="id-side-column">
        <section className="panel id-info-panel">
          <span className="id-info-icon">✧</span>
          <h2>Made for your workday.</h2>
          <p>Use your digital ID to check in at the office, connect with teammates and keep your work details close.</p>
          <div className="id-info-row"><span>✉</span><div><small>WORK EMAIL</small><strong>{person.Email || "—"}</strong></div></div>
          <div className="id-info-row"><span>♧</span><div><small>REPORTS TO</small><strong>{person.Manager || "—"}</strong></div></div>
          <div className="id-info-row"><span>♡</span><div><small>PEOPLE SINCE</small><strong>{person.Joined || "—"}</strong></div></div>
          <button className="soft-button" onClick={() => onAction("profile")}>View my full profile &nbsp;→</button>
        </section>
        <section className="id-security-note">
          <span aria-hidden="true">🔒</span>
          <p><strong>Just for you.</strong> Your employee details are private to your workspace. Share your ID only with people you trust.</p>
        </section>
      </aside>
    </div>
  </div>;
}
