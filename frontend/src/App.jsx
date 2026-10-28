import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import People from "./pages/people/People.jsx";
import IDCard from "./pages/id-card/IDCard.jsx";
import TimeSheet from "./pages/timesheet/TimeSheet.jsx";
import Attendance from "./pages/attendance/Attendance.jsx";
import Leave from "./pages/leave/Leave.jsx";
import Payroll from "./pages/payroll/Payroll.jsx";
import Expenses from "./pages/expenses/Expenses.jsx";
import Performance from "./pages/performance/Performance.jsx";
import Documents from "./pages/documents/Documents.jsx";
import Insurance from "./pages/insurance/Insurance.jsx";
import Connect from "./pages/connect/Connect.jsx";
import Settings from "./pages/settings/Settings.jsx";

const routes = [
  ["/",Dashboard],[ "/people",People ],[ "/id-card",IDCard ],[ "/timesheet",TimeSheet ],
  [ "/attendance",Attendance ],[ "/leave",Leave ],[ "/payroll",Payroll ],[ "/expenses",Expenses ],
  [ "/performance",Performance ],[ "/documents",Documents ],[ "/insurance",Insurance ],
  [ "/connect",Connect ],[ "/settings",Settings ],
];

export default function App() {
  return <BrowserRouter><Routes><Route element={<AppShell />}>{routes.map(([path,Page]) => <Route key={path} path={path} element={<Page />} />)}<Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></BrowserRouter>;
}
