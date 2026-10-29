export const store = {
  clockedIn: true,
  clockStartedAt: new Date(
    Date.now() - 3 * 60 * 60 * 1000 - 8 * 60 * 1000 - 4 * 1000,
  ).toISOString(),
  leaveBalances: [
    {
      type: "Work From Home",
      balance: 2.42,
      allowance: 90,
      used: 0,
      color: "orange",
    },
    {
      type: "Casual Leave",
      balance: 0.65,
      allowance: 24,
      used: 0,
      color: "green",
    },
    { type: "Comp Off", balance: 0, allowance: 0, used: 0, color: "red" },
  ],
  announcements: [
    {
      id: "announcement-birthday",
      title: "Happy Birthday @Ajay Kumar",
      message:
        "Warm wishes to the incredible men of our workplace — Happy International Men's Day!",
      postedAt: "2026-10-28T09:00:00.000Z",
    },
  ],
  vouchers: [
    { id: "voucher-flipkart", brand: "Flipkart", discount: "5%", logo: "F" },
    { id: "voucher-amazon", brand: "Amazon", discount: "4%", logo: "amazon" },
    { id: "voucher-myntra", brand: "Myntra", discount: "12%", logo: "M" },
  ],
  birthdays: [
    {
      Name: "Ajay Kumar",
      Initials: "AK",
      role: "Product Designer",
      date: "5 Nov",
      color: "avatar-blue",
    },
    {
      Name: "Pooja Sharma",
      Initials: "PS",
      role: "People Partner",
      date: "11 Nov",
      color: "avatar-rose",
    },
  ],
  anniversaries: [
    {
      Name: "Om Sharvesh Kumar",
      Initials: "OS",
      tenure: "1 year",
      date: "4 Nov",
      color: "avatar-violet",
    },
    {
      Name: "Muhammed Fahis",
      Initials: "MF",
      tenure: "2 years",
      date: "25 Nov",
      color: "avatar-blue",
    },
  ],
  holidays: [
    {
      id: "diwali-2026",
      name: "Diwali",
      date: "2026-11-09",
      note: "Company holiday",
    },
    {
      id: "chhath-puja-2026",
      name: "Chhath Puja",
      date: "2026-11-16",
      note: "Company holiday",
    },
  ],
  notifications: [
    {
      id: "attendance-oct-22",
      title: "Attendance:",
      message: "Regularisation request has been created for Oct 22, 2026",
      createdAt: "2026-10-28T10:00:00.000Z",
    },
    {
      id: "attendance-oct-26",
      title: "Attendance:",
      message: "Regularisation request has been created for Oct 26, 2026",
      createdAt: "2026-10-28T09:00:00.000Z",
    },
    {
      id: "leave-policy-casual",
      title: "Susi Jeyaprakash",
      message: "has assigned leave policy Casual Leave to you",
      createdAt: "2026-10-27T09:00:00.000Z",
    },
    {
      id: "leave-policy-wfh",
      title: "Susi Jeyaprakash",
      message: "has assigned leave policy Work From Home to you",
      createdAt: "2026-10-26T09:00:00.000Z",
    },
    {
      id: "leave-approved",
      title: "Susi Jeyaprakash",
      message: "has accepted your leave request",
      createdAt: "2026-10-25T09:00:00.000Z",
    },
    {
      id: "attendance-oct-19",
      title: "Attendance:",
      message: "Regularisation request has been created for Oct 19, 2026",
      createdAt: "2026-10-24T09:00:00.000Z",
    },
  ],
  employees: [
    {
      Name: "Mohan Kumar",
      Initials: "MK",
      Role: "Full Stack Developer",
      Department: "Engineering",
      Location: "Bengaluru",
      Status: "Active",
      Email: "mohan.kumar@adblisshrm.com",
      EmployeeID: "AD-2048",
      Joined: "January 2024",
      Manager: "Shailendra Kumar",
      color: "avatar-mohan",
    },
    {
      Name: "Dipti Narayan",
      Initials: "DN",
      Role: "Product Designer",
      Department: "Design",
      Location: "Bengaluru",
      Status: "Active",
      Email: "dipti.narayan@adblisshrm.com",
      EmployeeID: "AD-2084",
      Joined: "March 2023",
      Manager: "Ananya Rao",
      color: "avatar-blue",
    },
    {
      Name: "Shailendra Kumar",
      Initials: "SK",
      Role: "Engineering Manager",
      Department: "Engineering",
      Location: "Bengaluru",
      Status: "Active",
      Email: "shailendra.kumar@adblisshrm.com",
      EmployeeID: "AD-1906",
      Joined: "June 2021",
      Manager: "Arjun Mehta",
      color: "avatar-green",
    },
    {
      Name: "Pooja Sharma",
      Initials: "PS",
      Role: "People Partner",
      Department: "People",
      Location: "Mumbai",
      Status: "Active",
      Email: "pooja.sharma@adblisshrm.com",
      EmployeeID: "AD-2211",
      Joined: "September 2023",
      Manager: "Ananya Rao",
      color: "avatar-rose",
    },
    {
      Name: "Rohit Kapoor",
      Initials: "RK",
      Role: "Finance Analyst",
      Department: "Finance",
      Location: "Delhi",
      Status: "Active",
      Email: "rohit.kapoor@adblisshrm.com",
      EmployeeID: "AD-1772",
      Joined: "February 2022",
      Manager: "Devika Shah",
      color: "avatar-gold",
    },
    {
      Name: "Amita Nair",
      Initials: "AN",
      Role: "Marketing Lead",
      Department: "Marketing",
      Location: "Bengaluru",
      Status: "Active",
      Email: "amita.nair@adblisshrm.com",
      EmployeeID: "AD-2005",
      Joined: "August 2022",
      Manager: "Ishita Sen",
      color: "avatar-violet",
    },
    {
      Name: "Ravi Menon",
      Initials: "RM",
      Role: "Software Engineer",
      Department: "Engineering",
      Location: "Hyderabad",
      Status: "Active",
      Email: "ravi.menon@adblisshrm.com",
      EmployeeID: "AD-2310",
      Joined: "January 2025",
      Manager: "Shailendra Kumar",
      color: "avatar-blue",
    },
    {
      Name: "Nisha Verma",
      Initials: "NV",
      Role: "Customer Success",
      Department: "Customer Success",
      Location: "Pune",
      Status: "Active",
      Email: "nisha.verma@adblisshrm.com",
      EmployeeID: "AD-2328",
      Joined: "April 2025",
      Manager: "Sana Iqbal",
      color: "avatar-rose",
    },
  ],
  attendance: [
    {
      Date: "29 Oct",
      "Check in": "09:33 AM",
      "Check out": "—",
      Hours: "—",
      Status: "Present",
    },
    {
      Date: "28 Oct",
      "Check in": "09:47 AM",
      "Check out": "09:47 AM",
      Hours: "—",
      Status: "Anomaly",
    },
    {
      Date: "27 Oct",
      "Check in": "09:47 AM",
      "Check out": "06:45 PM",
      Hours: "8 Hours 57 Mins",
      Status: "Present",
    },
    {
      Date: "26 Oct",
      "Check in": "—",
      "Check out": "—",
      Hours: "—",
      Status: "Absent",
    },
    {
      Date: "25 Oct",
      "Check in": "—",
      "Check out": "—",
      Hours: "—",
      Status: "Weekly Off",
    },
  ],
  leave: [
    {
      Type: "Casual Leave",
      From: "Nov 12, 2026",
      To: "Nov 12, 2026",
      Days: "1 day",
      Status: "Pending",
    },
    {
      Type: "Work From Home",
      From: "Oct 19, 2026",
      To: "Oct 19, 2026",
      Days: "1 day",
      Status: "Approved",
    },
    {
      Type: "Casual Leave",
      From: "Sep 04, 2026",
      To: "Sep 04, 2026",
      Days: "1 day",
      Status: "Approved",
    },
  ],
  timesheet: [
    {
      Day: "Wednesday",
      Project: "Platform refresh",
      Start: "09:02 AM",
      End: "In progress",
      Hours: "8h 00m",
      Status: "In progress",
    },
    {
      Day: "Tuesday",
      Project: "Employee portal",
      Start: "08:54 AM",
      End: "06:12 PM",
      Hours: "9h 18m",
      Status: "Approved",
    },
    {
      Day: "Monday",
      Project: "Employee portal",
      Start: "09:42 AM",
      End: "05:30 PM",
      Hours: "7h 48m",
      Status: "Approved",
    },
    {
      Day: "Friday",
      Project: "Platform refresh",
      Start: "08:49 AM",
      End: "06:14 PM",
      Hours: "9h 25m",
      Status: "Approved",
    },
  ],
  payroll: [
    {
      Period: "October 2026",
      "Pay date": "Oct 31, 2026",
      "Gross pay": "₹ 1,05,000",
      "Net pay": "₹ 84,250",
      Status: "Processing",
    },
    {
      Period: "September 2026",
      "Pay date": "Sep 30, 2026",
      "Gross pay": "₹ 1,05,000",
      "Net pay": "₹ 84,250",
      Status: "Paid",
    },
    {
      Period: "August 2026",
      "Pay date": "Aug 31, 2026",
      "Gross pay": "₹ 1,05,000",
      "Net pay": "₹ 83,950",
      Status: "Paid",
    },
  ],
  expenses: [
    {
      Expense: "Client lunch",
      Submitted: "Oct 27, 2026",
      Amount: "₹ 1,250",
      Category: "Meals",
      Status: "In review",
    },
    {
      Expense: "Cab to office",
      Submitted: "Oct 24, 2026",
      Amount: "₹ 650",
      Category: "Travel",
      Status: "Approved",
    },
    {
      Expense: "Cloud tools",
      Submitted: "Oct 19, 2026",
      Amount: "₹ 2,350",
      Category: "Software",
      Status: "Approved",
    },
  ],
  performance: [
    {
      Goal: "Ship employee directory",
      Owner: "Mohan Kumar",
      "Due date": "Nov 15, 2026",
      Progress: "80%",
      Status: "On track",
    },
    {
      Goal: "Improve page performance",
      Owner: "Mohan Kumar",
      "Due date": "Nov 30, 2026",
      Progress: "55%",
      Status: "On track",
    },
    {
      Goal: "Complete security training",
      Owner: "Mohan Kumar",
      "Due date": "Oct 31, 2026",
      Progress: "100%",
      Status: "Complete",
    },
  ],
  documents: [
    {
      Document: "Employment agreement",
      Type: "Agreement",
      Updated: "Jan 03, 2024",
      Owner: "People team",
      Status: "Signed",
    },
    {
      Document: "Code of conduct",
      Type: "Policy",
      Updated: "Oct 15, 2026",
      Owner: "People team",
      Status: "Read",
    },
    {
      Document: "Benefits enrollment",
      Type: "Benefits",
      Updated: "Sep 01, 2026",
      Owner: "Mohan Kumar",
      Status: "Action needed",
    },
  ],
  insurance: [
    {
      Coverage: "Health insurance",
      Details: "Family floater · ₹5 lakh",
      Renewal: "Jan 01, 2027",
      Status: "Active",
    },
    {
      Coverage: "Personal accident",
      Details: "Group cover · ₹10 lakh",
      Renewal: "Jan 01, 2027",
      Status: "Active",
    },
    {
      Coverage: "Policy renewal",
      Details: "Open enrollment window",
      Renewal: "January 2027",
      Status: "Upcoming",
    },
  ],
  connect: [
    {
      Update: "Welcome our newest teammates!",
      "Posted by": "People team",
      Community: "Company-wide",
      When: "2 hours ago",
    },
    {
      Update: "November team lunch 🍕",
      "Posted by": "Dipti Narayan",
      Community: "Bengaluru",
      When: "Yesterday",
    },
    {
      Update: "Product launch celebration",
      "Posted by": "Shailendra Kumar",
      Community: "Engineering",
      When: "Oct 26",
    },
  ],
  settings: [
    { Preference: "Language", "Current setting": "English (India)" },
    { Preference: "Time zone", "Current setting": "Asia/Kolkata" },
    { Preference: "Email notifications", "Current setting": "Enabled" },
    { Preference: "Two-factor authentication", "Current setting": "Enabled" },
  ],
};

export const metrics = {
  dashboard: [
    { label: "Days present", value: "13", icon: "↗", note: "this month" },
    {
      label: "Leave balance",
      value: "3.07",
      icon: "◷",
      note: "days remaining",
    },
    {
      label: "Pending actions",
      value: "5",
      icon: "!",
      note: "Attendance anomaly on 2026-10-28",
    },
    {
      label: "Team members",
      value: "248",
      icon: "♧",
      note: "6 new faces this month",
    },
  ],
  people: [
    {
      label: "People at AdblissHRM",
      value: "248",
      icon: "♧",
      note: "Across 12 departments",
    },
    {
      label: "Departments",
      value: "12",
      icon: "▦",
      note: "Working as one team",
    },
    {
      label: "New this month",
      value: "6",
      icon: "✦",
      note: "Say a warm hello",
    },
    {
      label: "Birthdays this month",
      value: "8",
      icon: "♡",
      note: "A reason to celebrate",
    },
  ],
  idCard: [
    {
      label: "Employee ID",
      value: "KR-2048",
      icon: "▣",
      note: "Your digital work identity",
    },
    {
      label: "Department",
      value: "IT",
      icon: "♧",
      note: "Information Technology",
    },
    {
      label: "Work location",
      value: "Bengaluru",
      icon: "⌖",
      note: "Karnataka, India",
    },
    {
      label: "With AdblissHRM since",
      value: "2024",
      icon: "✦",
      note: "Your story so far",
    },
  ],
  timesheet: [
    {
      label: "Hours this week",
      value: "37h 20m",
      icon: "◷",
      note: "+2h 15m from last week",
    },
    {
      label: "Focused time",
      value: "32h",
      icon: "✦",
      note: "Time in deep work",
    },
    {
      label: "Projects touched",
      value: "4",
      icon: "↗",
      note: "Across 3 teams",
    },
    { label: "Weekly goal", value: "93%", icon: "✓", note: "40 hours" },
  ],
  attendance: [
    {
      label: "Present this month",
      value: "12 days",
      icon: "✓",
      note: "+2 from last month",
    },
    {
      label: "Average hours",
      value: "8h 42m",
      icon: "◷",
      note: "Your daily average",
    },
    { label: "Late arrivals", value: "1", icon: "!", note: "Looking good" },
    {
      label: "Attendance score",
      value: "96%",
      icon: "✦",
      note: "A great month so far",
    },
  ],
  leave: [
    {
      label: "Casual leave",
      value: "0.65 days",
      icon: "✳",
      note: "Of 24 annual days",
    },
    {
      label: "Work from home",
      value: "2.42 days",
      icon: "⌂",
      note: "Of 90 annual days",
    },
    {
      label: "Comp off",
      value: "0 days",
      icon: "◷",
      note: "No balance available",
    },
    {
      label: "Requests pending",
      value: "1",
      icon: "!",
      note: "Awaiting a manager",
    },
  ],
  payroll: [
    { label: "Next payday", value: "Oct 31", icon: "₹", note: "3 days to go" },
    {
      label: "Last net pay",
      value: "₹ 84,250",
      icon: "↗",
      note: "September 2026",
    },
    {
      label: "Annual CTC",
      value: "₹ 12.6L",
      icon: "▦",
      note: "As per latest revision",
    },
    {
      label: "Tax regime",
      value: "New regime",
      icon: "✓",
      note: "For FY 2026–27",
    },
  ],
  expenses: [
    {
      label: "Submitted this month",
      value: "₹ 4,250",
      icon: "↗",
      note: "Across 3 claims",
    },
    {
      label: "Awaiting approval",
      value: "2 claims",
      icon: "◷",
      note: "With your manager",
    },
    {
      label: "Reimbursed",
      value: "₹ 12,400",
      icon: "✓",
      note: "This financial year",
    },
    {
      label: "Available limit",
      value: "₹ 25,000",
      icon: "₹",
      note: "Annual allowance",
    },
  ],
  performance: [
    {
      label: "Current cycle",
      value: "Q4 2026",
      icon: "✦",
      note: "October — December",
    },
    {
      label: "Goals on track",
      value: "4 of 5",
      icon: "✓",
      note: "One needs a check-in",
    },
    {
      label: "Last check-in",
      value: "Oct 12",
      icon: "◷",
      note: "With Shailendra",
    },
    {
      label: "Feedback received",
      value: "3 notes",
      icon: "♡",
      note: "Your team sees you",
    },
  ],
  documents: [
    {
      label: "My documents",
      value: "8 files",
      icon: "▤",
      note: "Your personal library",
    },
    {
      label: "Company policies",
      value: "12 files",
      icon: "▦",
      note: "Always up to date",
    },
    {
      label: "Needs signature",
      value: "1",
      icon: "!",
      note: "One quick action",
    },
    {
      label: "Last updated",
      value: "Oct 15",
      icon: "◷",
      note: "Recently refreshed",
    },
  ],
  insurance: [
    {
      label: "Health cover",
      value: "₹ 5 lakh",
      icon: "♡",
      note: "Family floater",
    },
    {
      label: "Plan",
      value: "Family floater",
      icon: "♧",
      note: "You + 2 dependants",
    },
    {
      label: "Dependants",
      value: "2 enrolled",
      icon: "✓",
      note: "Coverage is active",
    },
    {
      label: "Renewal date",
      value: "Jan 01",
      icon: "◷",
      note: "2027 policy year",
    },
  ],
  connect: [
    {
      label: "Company updates",
      value: "3 new",
      icon: "✦",
      note: "Fresh from your team",
    },
    {
      label: "My communities",
      value: "4",
      icon: "♧",
      note: "Find your people",
    },
    {
      label: "Team celebrations",
      value: "2 soon",
      icon: "♡",
      note: "Don't miss a moment",
    },
    {
      label: "Unread messages",
      value: "5",
      icon: "✉",
      note: "Your team is talking",
    },
  ],
  settings: [
    { label: "Profile", value: "Up to date", icon: "✓", note: "Looking good" },
    {
      label: "Notifications",
      value: "On",
      icon: "♧",
      note: "You're in the loop",
    },
    {
      label: "Two-factor auth",
      value: "Enabled",
      icon: "▣",
      note: "Your account is secure",
    },
    {
      label: "Workspace",
      value: "AdblissHRM India",
      icon: "⌂",
      note: "Employee workspace",
    },
  ],
};

export const dashboardShortcuts = [
  {
    id: "attendance",
    label: "Attendance",
    href: "/attendance",
    icon: "▥",
    color: "#e9efff",
  },
  { id: "leave", label: "Leave", href: "/leave", icon: "🌴", color: "#e8f7f1" },
  { id: "holidays", label: "Holidays", href: "/holidays", icon: "🗓", color: "#fdeef0" },
  {
    id: "payroll",
    label: "Payroll",
    href: "/payroll",
    icon: "₹",
    color: "#fff5dc",
  },
  {
    id: "people",
    label: "Directory",
    href: "/people",
    icon: "♟",
    color: "#edf3ff",
  },
  {
    id: "performance",
    label: "Performance",
    href: "/performance",
    icon: "🏆",
    color: "#fff0e8",
  },
  {
    id: "id-card",
    label: "ID Card",
    href: "/id-card",
    icon: "▣",
    color: "#eef4f7",
  },

 
  {
    id: "connect",
    label: "Connect",
    href: "/connect",
    icon: "☏",
    color: "#f2edff",
  },

];

export const profile = {
  Name: "Mohan Kumar",
  Initials: "MK",
  Role: "Full Stack Developer",
  Department: "Information Technology",
  Location: "Bengaluru, India",
  EmployeeID: "AD-2048",
  Joined: "January 2024",
  Manager: "Shailendra Kumar",
  Email: "mohan.kumar@adblisshrm.com",
  color: "avatar-mohan",
};

export function idCardProfile() {
  return profile;
}

export function timesheetWeek() {
  return {
    totalHours: "37h 20m",
    days: [
      { short: "Mon", date: "26", hours: "7.8h", percent: 76 },
      { short: "Tue", date: "27", hours: "9.3h", percent: 91 },
      { short: "Wed", date: "28", hours: "8h", percent: 80, today: true },
      { short: "Thu", date: "29", hours: "—", percent: 5 },
      { short: "Fri", date: "30", hours: "—", percent: 5 },
      { short: "Sat", date: "31", hours: "—", percent: 3 },
      { short: "Sun", date: "1", hours: "—", percent: 3 },
    ],
  };
}

export function createRecord(module, body) {
  const record = {
    ...body,
    Status: body.Status || (module === "leave" ? "Pending" : "In review"),
    CreatedAt: new Date().toISOString(),
  };
  if (module === "people") {
    record.Initials = String(body.Name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase();
    record.Location ||= "Bengaluru";
    record.Status = "Invited";
    record.Email ||= "";
    record.color = "avatar-violet";
  }
  if (module === "leave") {
    record.From ||= body.From || "Not specified";
    record.To ||= body.To || record.From;
    record.Days ||= "1 day";
  }
  return record;
}
