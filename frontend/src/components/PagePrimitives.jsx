import { useMemo, useState } from "react";

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export function MetricGrid({ metrics = [], className = "" }) {
  const palettes = [["#f0edff","#6d5ce8"],["#e9f8f2","#159a65"],["#fff4e5","#d99322"],["#fff0f2","#e85c69"]];
  return <div className={`metric-grid ${className}`.trim()}>{metrics.map((metric, index) => {
    const [tint, tone] = palettes[index % palettes.length];
    return <article className="metric-card" style={{ "--tint": tint, "--tone": tone }} key={metric.label}>
      <div className="metric-top">{metric.label}<span className="metric-icon">{metric.icon || "✦"}</span></div>
      <div className="metric-value">{metric.value}</div><div className="metric-foot">{metric.note || "Updated just now"}</div>
    </article>;
  })}</div>;
}

export function DataTable({ headers = [], rows = [] }) {
  if (!rows.length) return <div className="empty-state"><span>✦</span><strong>Nothing to show yet</strong><p>Your updates will appear here when they're ready.</p></div>;
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>
    {rows.map((row, rowIndex) => <tr key={`${row[headers[0]] || "record"}-${rowIndex}`}>{headers.map((header) => {
      const value = row[header] ?? "—";
      if (header.toLowerCase() !== "status") return <td key={header}>{value}</td>;
      const statusClass = /pending|review|processing|upcoming|action needed|in progress|anomaly/i.test(String(value)) ? "pending" : /denied|rejected|overdue|absent/i.test(String(value)) ? "review" : "";
      return <td key={header}><span className={`status-badge ${statusClass}`}>● {value}</span></td>;
    })}</tr>)}
  </tbody></table></div>;
}

export function GenericModulePage({ config, data = {}, onAction }) {
  const [query, setQuery] = useState("");
  const records = data.records || [];
  const filteredRecords = useMemo(() => records.filter((record) => Object.values(record).join(" ").toLowerCase().includes(query.toLowerCase())), [records, query]);
  return <>
    <div className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS / {config.section}</div><h1>{config.icon} &nbsp;{config.title}</h1><p>{config.description}</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => onAction("export")}>↓ &nbsp;Export</button><button className="primary-button" onClick={() => onAction("module-action")}>＋ &nbsp;{config.primaryAction}</button></div></div>
    <MetricGrid metrics={data.metrics || []} />
    <section className="panel content-panel"><div className="toolbar"><div><h2>{config.listTitle || `Your ${config.title.toLowerCase()}`}</h2><p>{filteredRecords.length} records · Updated just now</p></div><div className="toolbar-actions"><input className="filter-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`⌕  Search ${config.title.toLowerCase()}...`} /><button className="secondary-button" onClick={() => onAction("filter")}>Filter ⌄</button></div></div><DataTable headers={config.columns || []} rows={filteredRecords} /></section>
  </>;
}
