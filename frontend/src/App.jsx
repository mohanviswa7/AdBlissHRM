import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "./components/AppShell.jsx";
import AuthPage from "./pages/auth/AuthPage.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import People from "./pages/people/People.jsx";
import IDCard from "./pages/id-card/IDCard.jsx";
import TimeSheet from "./pages/timesheet/TimeSheet.jsx";
import Attendance from "./pages/attendance/Attendance.jsx";
import Leave from "./pages/leave/Leave.jsx";
import Holidays from "./pages/holidays/Holidays.jsx";
import Payroll from "./pages/payroll/Payroll.jsx";
import Expenses from "./pages/expenses/Expenses.jsx";
import Performance from "./pages/performance/Performance.jsx";
import Documents from "./pages/documents/Documents.jsx";
import Insurance from "./pages/insurance/Insurance.jsx";
import Connect from "./pages/connect/Connect.jsx";
import Settings from "./pages/settings/Settings.jsx";
import { checkSession } from "./store/hrmSlice.js";

const routes = [
  ["/", Dashboard],
  ["/people", People],
  ["/id-card", IDCard],
  ["/timesheet", TimeSheet],
  ["/attendance", Attendance],
  ["/leave", Leave],
  ["/holidays", Holidays],
  ["/payroll", Payroll],
  ["/expenses", Expenses],
  ["/performance", Performance],
  ["/documents", Documents],
  ["/insurance", Insurance],
  ["/connect", Connect],
  ["/settings", Settings],
];

function SessionRoutes() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.hrm.auth.status);
  const location = useLocation();

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  if (authStatus === "checking") {
    return <div className="auth-loading" role="status">Getting your workspace ready…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authStatus === "authenticated"
          ? <Navigate to="/" replace />
          : <AuthPage mode="login" />}
      />
      <Route
        path="/signup"
        element={authStatus === "authenticated"
          ? <Navigate to="/" replace />
          : <AuthPage mode="signup" />}
      />
      <Route
        path="/forgot-password"
        element={authStatus === "authenticated"
          ? <Navigate to="/" replace />
          : <AuthPage mode="forgot" />}
      />
      <Route
        path="/reset-password"
        element={authStatus === "authenticated"
          ? <Navigate to="/" replace />
          : <AuthPage mode="reset" />}
      />
      <Route
        element={authStatus === "authenticated"
          ? <Outlet />
          : <Navigate to="/login" replace state={{ from:location }} />}
      >
        <Route path="/change-password" element={<AuthPage mode="change" />} />
        <Route element={<AppShell />}>
          {routes.map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionRoutes />
    </BrowserRouter>
  );
}
