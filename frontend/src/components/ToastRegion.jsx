import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "../store/hrmSlice.js";

export default function ToastRegion() {
  const toasts = useSelector((state) => state.hrm.toasts);
  const dispatch = useDispatch();
  return <div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className="toast" key={toast.id}><b>✓</b>{toast.message}<button aria-label="Dismiss notification" onClick={() => dispatch(dismissToast(toast.id))}>×</button></div>)}</div>;
}
