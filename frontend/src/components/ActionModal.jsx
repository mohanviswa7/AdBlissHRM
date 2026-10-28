import { useEffect, useState } from "react";

export default function ActionModal({ modal, onClose, onSubmit }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  useEffect(() => { setValues({}); setError(""); }, [modal]);
  if (!modal) return null;
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try { await onSubmit(values); }
    catch (submitError) { setError(submitError.message); }
  };
  const submitContent = async () => {
    setError("");
    try { await onSubmit({}); }
    catch (submitError) { setError(submitError.message); }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-top"><h2 id="modal-title">{modal.title}</h2><button className="close-button" onClick={onClose} aria-label="Close dialog">×</button></div>
      {modal.description && <p className="modal-copy">{modal.description}</p>}
      {modal.fields ? <form className="form-grid" onSubmit={submit}>{modal.fields.map((field) => <div className="form-field" key={field.key}>
        <label htmlFor={field.id}>{field.label}</label>
        {field.options ? <select id={field.id} value={values[field.key] || field.options[0]} onChange={(event) => update(field.key, event.target.value)}>{field.options.map((option) => <option key={option}>{option}</option>)}</select>
          : <input id={field.id} type={field.type || "text"} value={values[field.key] || ""} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder || ""} required={field.required || false} min={field.min} />}
      </div>)}{error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">{modal.submitLabel || "Save"}</button></div></form>
        : <><div className="modal-content">{modal.content}</div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button>{(modal.onConfirm || modal.callback) && <button className="primary-button" onClick={submitContent}>{modal.submitLabel || "Done"}</button>}</div></>}
    </section>
  </div>;
}
