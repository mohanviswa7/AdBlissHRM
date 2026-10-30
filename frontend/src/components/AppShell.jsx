import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { pageConfigs, pageConfigById } from "../pages/config.js";
import AdblissLogo from "../Assets/Adbliss HRM Logo.png";
import "../pages/attendance/module.css";
import "../pages/connect/module.css";
import "../pages/dashboard/module.css";
import "../pages/dashboard/layout.css";
import "../pages/documents/module.css";
import "../pages/expenses/module.css";
import "../pages/insurance/module.css";
import "../pages/leave/module.css";
import "../pages/payroll/module.css";
import "../pages/people/module.css";
import "../pages/performance/module.css";
import "../pages/settings/module.css";
import "../pages/timesheet/module.css";
import {
  createModuleRecord,
  loadModule, loadPeopleOverview,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  showToast,
  signOut,
  toggleAttendanceClock,
  updateQuickLinks,
} from "../store/hrmSlice.js";
import ActionModal from "./ActionModal.jsx";
import ToastRegion from "./ToastRegion.jsx";

const groups = [
  { title:"YOUR SPACE", ids:["dashboard","people","id-card","attendance","leave","holidays"] },
  { title:"GROW & THRIVE", ids:["payroll","performance","documents"] },
  { title:"STAY CONNECTED", ids:["connect"] },
];
const icons = Object.fromEntries(pageConfigs.map((page) => [page.id, page.icon]));
const formDefinitions = {
  people:{title:"Invite someone to the team",submitLabel:"Send invitation",fields:[{key:"Name",id:"person-name",label:"FULL NAME",placeholder:"Their name",required:true},{key:"Email",id:"person-email",label:"WORK EMAIL",type:"email",placeholder:"name@company.com",required:true},{key:"Role",id:"person-role",label:"JOB TITLE",placeholder:"e.g. Product Designer",required:true},{key:"Department",id:"person-department",label:"TEAM",options:["Engineering","Design","People","Finance","Marketing","Customer Success"]}]},
  leave:{title:"A little time for you",submitLabel:"Send leave request",fields:[{key:"Type",id:"leave-type",label:"LEAVE TYPE",options:["Casual Leave","Work From Home","Sick Leave","Comp Off"]},{key:"From",id:"leave-from",label:"FROM",type:"date",required:true},{key:"To",id:"leave-to",label:"TO",type:"date",required:true},{key:"Note",id:"leave-note",label:"A NOTE FOR YOUR MANAGER",placeholder:"Anything they should know?"}]},
  expenses:{title:"Add an expense",submitLabel:"Submit for review",fields:[{key:"Expense",id:"expense-name",label:"WHAT WAS IT FOR?",placeholder:"e.g. Client lunch",required:true},{key:"Amount",id:"expense-amount",label:"AMOUNT (₹)",type:"number",min:"1",required:true},{key:"Category",id:"expense-category",label:"CATEGORY",options:["Travel","Meals","Software","Office supplies","Other"]},{key:"Submitted",id:"expense-date",label:"DATE",type:"date",required:true}]},
  performance:{title:"Plant a new goal",submitLabel:"Add my goal",fields:[{key:"Goal",id:"goal-name",label:"WHAT WOULD YOU LIKE TO DO?",placeholder:"A goal that matters to you",required:true},{key:"Owner",id:"goal-owner",label:"OWNER",placeholder:"Mohan Kumar"},{key:"Due date",id:"goal-due",label:"TARGET DATE",type:"date",required:true},{key:"Progress",id:"goal-progress",label:"PROGRESS",placeholder:"0%"}]},
  documents:{title:"Add a document",submitLabel:"Save document",fields:[{key:"Document",id:"document-name",label:"DOCUMENT NAME",placeholder:"e.g. Updated tax declaration",required:true},{key:"Type",id:"document-type",label:"DOCUMENT TYPE",options:["Agreement","Policy","Benefits","Tax","Other"]},{key:"Owner",id:"document-owner",label:"OWNER",placeholder:"Mohan Kumar"}]},
  connect:{title:"Share a little good news",submitLabel:"Share with the team",fields:[{key:"Update",id:"connect-title",label:"YOUR UPDATE",placeholder:"What's happening?",required:true},{key:"Posted by",id:"connect-author",label:"POSTED BY",placeholder:"Mohan Kumar"},{key:"Community",id:"connect-community",label:"SHARE WITH",options:["Company-wide","Engineering","Bengaluru","My team"]}]},
  timesheet:{title:"Capture your time",submitLabel:"Save time entry",fields:[{key:"Day",id:"time-day",label:"DAY",options:["Wednesday","Thursday","Friday","Monday","Tuesday"]},{key:"Project",id:"time-project",label:"PROJECT",placeholder:"What were you working on?",required:true},{key:"Start",id:"time-start",label:"START TIME",type:"time",required:true},{key:"End",id:"time-end",label:"END TIME",type:"time",required:true},{key:"Hours",id:"time-hours",label:"TOTAL HOURS",placeholder:"e.g. 2h 30m",required:true}]},
};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = useSelector((value) => value.hrm);
  const route = useMemo(() => pageConfigs.find((page) => page.path === location.pathname) || pageConfigs[0], [location.pathname]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [quickLinks, setQuickLinks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adblisshrm-quick-links")) || ["people","id-card","timesheet","attendance","leave","payroll","expenses","performance","documents","insurance"]; }
    catch { return ["people","id-card","timesheet","attendance","leave","payroll","expenses","performance","documents","insurance"]; }
  });
  const moduleData = state.modules[route.id];
  const currentUser = state.auth.user;
  const notifications = state.notifications;
  const unreadNotifications = state.unreadNotifications;
  const userName = currentUser?.name || "Employee";
  const userInitials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const peoplePageData =
    route.id === "people"
      ? moduleData || {
          records: [],
          error: state.errors.people || "Employee directory is unavailable.",
        }
      : moduleData;
  const peopleData = state.modules.people?.records || [];
  const matchedPages = pageConfigs.filter((page) => page.title.toLowerCase().includes(search.toLowerCase()) || page.section.toLowerCase().includes(search.toLowerCase()));
  const matchedPeople = search.trim().length > 1 ? peopleData.filter((person) => `${person.Name} ${person.Role} ${person.Department}`.toLowerCase().includes(search.toLowerCase())).slice(0, 4) : [];

  useEffect(() => {
    dispatch(loadModule(route.id));
    if (route.id === "people") dispatch(loadPeopleOverview());
  }, [dispatch, route.id]);
  useEffect(() => { document.body.classList.toggle("dark-mode", darkMode); return () => document.body.classList.remove("dark-mode"); }, [darkMode]);
  useEffect(() => {
    document.title = `${route.title} — AdblissHRM`;
  }, [route.id, route.title]);
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("#global-search")?.focus(); }
      if (event.key === "Escape") { setModal(null); setSearchOpen(false); setProfileMenuOpen(false); setNotificationsOpen(false); }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!search.trim() || search.trim().length < 2 || peopleData.length) return;
    dispatch(loadModule("people"));
  }, [dispatch, search, peopleData.length]);

  useEffect(() => {
    if (notificationsOpen) dispatch(loadNotifications());
  }, [dispatch, notificationsOpen]);

  const action = (name) => {
    if (name === "module-action") {
      if (route.id === "id-card") { window.print(); return; }
      if (route.id === "attendance") {
        setModal({title:"Request an attendance correction",submitLabel:"Send correction request",callback:"attendance",fields:[{key:"Date",id:"correction-date",label:"DATE",type:"date",required:true},{key:"Check in",id:"correction-checkin",label:"CHECK IN TIME",type:"time",required:true},{key:"Check out",id:"correction-checkout",label:"CHECK OUT TIME",type:"time"},{key:"Reason",id:"correction-reason",label:"WHAT HAPPENED?",placeholder:"A quick note for your manager",required:true}]});
        return;
      }
      if (route.id === "payroll" || route.id === "insurance") { dispatch(showToast({message:route.id === "payroll" ? "Your latest payslip is ready to view." : "Your coverage details are shown below."})); return; }
      if (route.id === "settings") {
        setModal({title:"Your workspace preferences",submitLabel:"Save preferences",callback:"settings",fields:[{key:"Current setting",id:"setting-language",label:"LANGUAGE",options:["English (India)","English (US)","Hindi"]},{key:"Time zone",id:"setting-timezone",label:"TIME ZONE",options:["Asia/Kolkata","Asia/Singapore","UTC"]}]});
        return;
      }
      if (formDefinitions[route.id]) setModal({ ...formDefinitions[route.id], callback:route.id });
      return;
    }
    if (name === "export") {
      const records = moduleData?.records || moduleData?.attendance || [];
      if (!records.length) { dispatch(showToast({message:"There isn't anything to export yet."})); return; }
      const headers = Object.keys(records[0]);
      const csv = [headers, ...records.map((record) => headers.map((header) => record[header] ?? ""))].map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(",")).join("\r\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8" }));
      link.download = `${route.id}-report.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      dispatch(showToast({message:`${route.title} report downloaded.`})); return;
    }
    if (name === "share-id") {
      navigator.clipboard?.writeText(`${window.location.origin}/id-card`)
        .then(() => dispatch(showToast({message:"Your ID card link is copied."})))
        .catch(() => dispatch(showToast({message:"Your ID card is ready to share from this page."})));
      return;
    }
    if (name === "customize") {
      setModal({title:"Make it yours",submitLabel:"Save my shortcuts",callback:"customize",quickLinks,content:<div className="shortcut-options">{pageConfigs.filter((page) => page.id !== "dashboard" && page.id !== "connect" && page.id !== "holidays" && page.id !== "settings").map((page) => <label key={page.id}><input type="checkbox" value={page.id} defaultChecked={quickLinks.includes(page.id)} /><span>{page.icon}</span>{page.navigation}</label>)}</div>,description:"Keep the shortcuts that make your workday feel a little easier."}); return;
    }
    if (name === "clock") { dispatch(toggleAttendanceClock()); return; }
    if (name === "filter") { dispatch(showToast({message:"Use search to quickly narrow down these records."})); return; }
    if (name === "week-previous" || name === "week-next") { dispatch(showToast({message:"Showing the current sample work week."})); return; }
    if (name === "week-current" || name === "week-filter") { dispatch(showToast({message:"Your timesheet is showing this week."})); return; }
    if (name === "theme") { setDarkMode((value) => !value); return; }
    if (name === "menu") { setMobileOpen((value) => !value); return; }
    if (name === "close") { setModal(null); return; }
    if (name === "calendar") {
      setModal({title:"A little look ahead",submitLabel:"Lovely",content:<div className="calendar-events"><div className="calendar-event"><span>5 NOV</span><strong>Team sync</strong><small>11:00 AM · Engineering</small></div><div className="calendar-event"><span>12 NOV</span><strong>Casual leave</strong><small>Pending manager approval</small></div><div className="calendar-event"><span>11 NOV</span><strong>Pooja Sharma's birthday</strong><small>Send a little hello 🎂</small></div></div>}); return;
    }
    if (name === "notifications") { setNotificationsOpen((value) => !value); setProfileMenuOpen(false); return; }
    if (name === "profile") { setProfileMenuOpen((value) => !value); setNotificationsOpen(false); return; }
    if (name === "assistant") {
      setModal({title:"A little help from AdblissHRM ✨",submitLabel:"Ask away",callback:"assistant",description:"What can I find for you today?",content:<div className="assistant-choices"><button type="button" onClick={() => dispatch(showToast({message:"You have 3.07 days of leave available."}))}>🏝 &nbsp; How much leave do I have?</button><button type="button" onClick={() => dispatch(showToast({message:"Your October payslip will be ready on October 31."}))}>₹ &nbsp; When is payday?</button><button type="button" onClick={() => dispatch(showToast({message:"You're currently clocked in. Your time today is being tracked."}))}>◷ &nbsp; How are my work hours?</button><input id="assistant-question" className="filter-input" placeholder="Ask me anything about your HR..." /></div>}); return;
    }
    if (name === "help") { setModal({title:"We'd love to help.",submitLabel:"Send message",callback:"help",description:"The People team is just a message away.",content:<textarea id="help-message" className="filter-input" rows="4" placeholder="Tell us what you need..." />}); }
  };

  const logout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/login", { replace:true });
    } catch (error) {
      dispatch(showToast({ message:error.message || "We couldn't sign you out. Please try again." }));
    }
  };

  const submitModal = async (values) => {
    if (modal.callback === "customize") {
      const selected = [...document.querySelectorAll(".shortcut-options input:checked")].map((input) => input.value);
      if (!selected.length) throw new Error("Keep at least one shortcut on your dashboard.");
      try { localStorage.setItem("adblisshrm-quick-links", JSON.stringify(selected)); }
      catch { throw new Error("Your browser couldn't save these preferences."); }
      setQuickLinks(selected); dispatch(updateQuickLinks(selected)); setModal(null); dispatch(showToast({message:"Your dashboard is looking more like you."})); return;
    }
    if (modal.callback === "assistant") {
      const question = document.querySelector("#assistant-question")?.value.trim();
      if (!question) throw new Error("Choose a question above or type your own.");
      setModal(null); dispatch(showToast({message:`I'll help you find: ${question}`})); return;
    }
    if (modal.callback === "help") {
      if (!document.querySelector("#help-message")?.value.trim()) throw new Error("Add a short message so we know how to help.");
      setModal(null); dispatch(showToast({message:"Your message is ready for the People team."})); return;
    }
    if (modal.callback === "help") {
      if (!document.querySelector("#help-message")?.value.trim()) throw new Error("Add a short message so we know how to help.");
      setModal(null); dispatch(showToast({message:"Your message is ready for the People team."})); return;
    }
    await dispatch(createModuleRecord({id:modal.callback,record:values})).unwrap();
    setModal(null);
  };

  const openPerson = (person) => setModal({title:person.Name,content:<><div className="profile-modal-person"><span className={`avatar ${person.color || "avatar-blue"}`}>{person.Initials || person.Name.split(" ").map((part) => part[0]).join("").slice(0,2)}</span><div><strong>{person.Role}</strong><small>{person.Department} · {person.Location}</small></div></div><div className="profile-modal-detail"><span>WORK EMAIL</span><strong>{person.Email}</strong></div><div className="profile-modal-detail"><span>EMPLOYEE ID</span><strong>{person.EmployeeID || "New teammate"}</strong></div></>});
  const selectSearchResult = (person) => { navigate("/people"); setSearch(""); setSearchOpen(false); if (person) openPerson(person); };

  return <div className={`app-shell ${route.id === "dashboard" ? "dashboard-shell" : ""}`}>
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <NavLink className="brand-mark" to="/" aria-label="AdblissHRM home"><img src={AdblissLogo} alt="AdblissHRM logo" /></NavLink>
      <div className="workspace-switch"><span className="workspace-avatar">A</span><span>AdblissHRM<small>Workspace</small></span><b>⌄</b></div>
      <nav className="side-nav" aria-label="Main navigation">{groups.map((group) => <div key={group.title}><div className="nav-caption">{group.title}</div>{group.ids.map((id) => {
        const page = pageConfigById[id];
        return <NavLink key={id} to={page.path} end={id === "dashboard"} className={({isActive}) => `side-link ${isActive?"active":""}`} onClick={() => setMobileOpen(false)}><span>{icons[id]}</span>{page.navigation}</NavLink>;
      })}<div className="nav-divider" /></div>)}
        <NavLink to="/settings" className={({isActive}) => `side-link ${isActive?"active":""}`}><span>⚙</span>Settings</NavLink>
      </nav>
      <div className="sidebar-bottom"><button className="profile-mini" onClick={() => action("profile")}><span className="avatar avatar-mohan">{userInitials}</span><span>{userName}<small>{currentUser?.role || "Employee"}</small></span><b>•••</b></button></div>
    </aside>
    <main className="main-area"><header className="topbar">
      <button className="icon-button mobile-menu" onClick={() => action("menu")} aria-label="Toggle navigation">☰</button>
      <div className="dashboard-wordmark" aria-label="AdblissHRM">ADBLISSHRM</div>
      <div className="breadcrumb-button dashboard-breadcrumb">{route.section} <span>/</span> <b>{route.title}</b></div>
      <div className="global-search"><span>⌕</span><input id="global-search" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Enter" && matchedPages[0]) { navigate(matchedPages[0].path); setSearch(""); setSearchOpen(false); } }} placeholder="Search people, pages, anything..." autoComplete="off" /><kbd>⌘ K</kbd>{searchOpen && search.trim() && <div className="global-search-results">{matchedPages.map((page) => <button className="search-option" key={page.id} onClick={() => { navigate(page.path); setSearch(""); setSearchOpen(false); }}><span>{page.icon}</span><div><strong>{page.title}</strong><small>{page.section}</small></div></button>)}{matchedPeople.map((person) => <button className="search-option" key={person.EmployeeID || person.Name} onClick={() => selectSearchResult(person)}><span className={`avatar ${person.color || "avatar-blue"}`}>{person.Initials}</span><div><strong>{person.Name}</strong><small>{person.Role} · {person.Department}</small></div></button>)}{!matchedPages.length && !matchedPeople.length && <div className="search-empty">No matches yet. Try a teammate or module.</div>}</div>}</div>
      <div className="topbar-spacer" />{route.id === "dashboard" && <span className="dashboard-role-pill">Employee</span>}<button className="top-action" onClick={() => action("help")}><span>?</span> Help</button><button className="icon-button" onClick={() => action("theme")} aria-label="Toggle dark mode">☼</button><button className="icon-button notifications-trigger" onClick={() => action("notifications")} aria-label={`Notifications, ${unreadNotifications} unread`} aria-expanded={notificationsOpen}>♧{unreadNotifications > 0 && <i className="notification-dot" />}{unreadNotifications > 0 && <span className="notification-count">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</button><button className="avatar avatar-mohan user-avatar" onClick={() => action("profile")} aria-label="Open profile menu" aria-expanded={profileMenuOpen}>{userInitials}</button>
      {profileMenuOpen && <div className="profile-popover" role="menu">
        <div className="profile-popover-user"><span className="avatar avatar-mohan">{userInitials}</span><div><strong>{userName}</strong><small>{currentUser?.email}</small></div></div>
        <button role="menuitem" onClick={() => { setProfileMenuOpen(false); navigate("/id-card"); }}>♙ <span>My Profile</span></button>
        <button role="menuitem" onClick={() => { setProfileMenuOpen(false); navigate("/change-password"); }}>♙ <span>Change Password</span></button>
        <button className="sign-out-item" role="menuitem" onClick={logout}>↪ <span>Sign Out</span></button>
      </div>}
      {notificationsOpen && <div className="notifications-popover" role="dialog" aria-label="Notifications">
        <header><strong>Notifications</strong><span>{unreadNotifications} unread</span></header>
        {notifications.length ? <div className="notifications-list">{notifications.map((notification) => <button className={`notification-entry ${notification.read ? "read" : ""}`} key={notification.id} onClick={() => {
          if (!notification.read) dispatch(markNotificationRead(notification.id)).unwrap().catch((error) => dispatch(showToast({ message:error.message })));
        }}>{notification.title && <strong className="notification-chip">{notification.title}</strong>}<span>{notification.message}</span>{notification.createdAt && <small>{new Date(notification.createdAt).toLocaleDateString()}</small>}</button>)}</div> : <p className="notifications-empty">You're all caught up.</p>}
        {unreadNotifications > 0 && <button className="notifications-mark-all" onClick={() => dispatch(markAllNotificationsRead()).unwrap().catch((error) => dispatch(showToast({ message:error.message })))}>Mark all as read</button>}
      </div>}
    </header><section className="page-scroll"><div id="app" data-module={route.id}>
      {route.id !== "people" && state.errors[route.id] ? <section className="panel error-panel"><span>!</span><h2>We couldn't load this page.</h2><p>{state.errors[route.id]}</p><button className="primary-button" onClick={() => dispatch(loadModule(route.id))}>Try again</button></section>
        : state.loading[route.id] || !peoplePageData ? <div className="loading-state"><span className="loading-spinner" /><p>Getting your {route.title.toLowerCase()} ready...</p></div>
          : <Outlet context={{config:route,data:peoplePageData,onAction:action,openPerson,quickLinks,dispatch,clockedIn:state.clockedIn,peopleData,user:currentUser}} />}
    </div></section></main>
    <button className="assistant-button" onClick={() => action("assistant")} aria-label="Open AdblissHRM assistant"><span>✦</span></button>
    <ToastRegion />
    <ActionModal modal={modal} onClose={() => setModal(null)} onSubmit={submitModal} />
  </div>;
}
