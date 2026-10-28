export const store = {
  clockedIn: true,
  employees: [
    { Name:"Mohan Kumar", Initials:"MK", Role:"Full Stack Developer", Department:"Engineering", Location:"Bengaluru", Status:"Active", Email:"mohan.kumar@kredily.com", EmployeeID:"KR-2048", Joined:"January 2024", Manager:"Shailendra Kumar", color:"avatar-mohan" },
    { Name:"Dipti Narayan", Initials:"DN", Role:"Product Designer", Department:"Design", Location:"Bengaluru", Status:"Active", Email:"dipti.narayan@kredily.com", EmployeeID:"KR-2084", Joined:"March 2023", Manager:"Ananya Rao", color:"avatar-blue" },
    { Name:"Shailendra Kumar", Initials:"SK", Role:"Engineering Manager", Department:"Engineering", Location:"Bengaluru", Status:"Active", Email:"shailendra.kumar@kredily.com", EmployeeID:"KR-1906", Joined:"June 2021", Manager:"Arjun Mehta", color:"avatar-green" },
    { Name:"Pooja Sharma", Initials:"PS", Role:"People Partner", Department:"People", Location:"Mumbai", Status:"Active", Email:"pooja.sharma@kredily.com", EmployeeID:"KR-2211", Joined:"September 2023", Manager:"Ananya Rao", color:"avatar-rose" },
    { Name:"Rohit Kapoor", Initials:"RK", Role:"Finance Analyst", Department:"Finance", Location:"Delhi", Status:"Active", Email:"rohit.kapoor@kredily.com", EmployeeID:"KR-1772", Joined:"February 2022", Manager:"Devika Shah", color:"avatar-gold" },
    { Name:"Amita Nair", Initials:"AN", Role:"Marketing Lead", Department:"Marketing", Location:"Bengaluru", Status:"Active", Email:"amita.nair@kredily.com", EmployeeID:"KR-2005", Joined:"August 2022", Manager:"Ishita Sen", color:"avatar-violet" },
    { Name:"Ravi Menon", Initials:"RM", Role:"Software Engineer", Department:"Engineering", Location:"Hyderabad", Status:"Active", Email:"ravi.menon@kredily.com", EmployeeID:"KR-2310", Joined:"January 2025", Manager:"Shailendra Kumar", color:"avatar-blue" },
    { Name:"Nisha Verma", Initials:"NV", Role:"Customer Success", Department:"Customer Success", Location:"Pune", Status:"Active", Email:"nisha.verma@kredily.com", EmployeeID:"KR-2328", Joined:"April 2025", Manager:"Sana Iqbal", color:"avatar-rose" },
  ],
  attendance: [
    { Date:"Today, Oct 28", "Check in":"09:02 AM", "Check out":"In progress", Hours:"In progress", Status:"Present" },
    { Date:"Tue, Oct 27", "Check in":"08:54 AM", "Check out":"06:12 PM", Hours:"9h 18m", Status:"Present" },
    { Date:"Mon, Oct 26", "Check in":"09:42 AM", "Check out":"05:30 PM", Hours:"7h 48m", Status:"Needs review" },
    { Date:"Fri, Oct 23", "Check in":"08:49 AM", "Check out":"06:14 PM", Hours:"9h 25m", Status:"Present" },
    { Date:"Thu, Oct 22", "Check in":"09:01 AM", "Check out":"06:03 PM", Hours:"9h 02m", Status:"Present" },
  ],
  leave: [
    { Type:"Casual Leave", From:"Nov 12, 2026", To:"Nov 12, 2026", Days:"1 day", Status:"Pending" },
    { Type:"Work From Home", From:"Oct 19, 2026", To:"Oct 19, 2026", Days:"1 day", Status:"Approved" },
    { Type:"Casual Leave", From:"Sep 04, 2026", To:"Sep 04, 2026", Days:"1 day", Status:"Approved" },
  ],
  timesheet: [
    { Day:"Wednesday", Project:"Platform refresh", Start:"09:02 AM", End:"In progress", Hours:"8h 00m", Status:"In progress" },
    { Day:"Tuesday", Project:"Employee portal", Start:"08:54 AM", End:"06:12 PM", Hours:"9h 18m", Status:"Approved" },
    { Day:"Monday", Project:"Employee portal", Start:"09:42 AM", End:"05:30 PM", Hours:"7h 48m", Status:"Approved" },
    { Day:"Friday", Project:"Platform refresh", Start:"08:49 AM", End:"06:14 PM", Hours:"9h 25m", Status:"Approved" },
  ],
  payroll: [
    { Period:"October 2026", "Pay date":"Oct 31, 2026", "Gross pay":"₹ 1,05,000", "Net pay":"₹ 84,250", Status:"Processing" },
    { Period:"September 2026", "Pay date":"Sep 30, 2026", "Gross pay":"₹ 1,05,000", "Net pay":"₹ 84,250", Status:"Paid" },
    { Period:"August 2026", "Pay date":"Aug 31, 2026", "Gross pay":"₹ 1,05,000", "Net pay":"₹ 83,950", Status:"Paid" },
  ],
  expenses: [
    { Expense:"Client lunch", Submitted:"Oct 27, 2026", Amount:"₹ 1,250", Category:"Meals", Status:"In review" },
    { Expense:"Cab to office", Submitted:"Oct 24, 2026", Amount:"₹ 650", Category:"Travel", Status:"Approved" },
    { Expense:"Cloud tools", Submitted:"Oct 19, 2026", Amount:"₹ 2,350", Category:"Software", Status:"Approved" },
  ],
  performance: [
    { Goal:"Ship employee directory", Owner:"Mohan Kumar", "Due date":"Nov 15, 2026", Progress:"80%", Status:"On track" },
    { Goal:"Improve page performance", Owner:"Mohan Kumar", "Due date":"Nov 30, 2026", Progress:"55%", Status:"On track" },
    { Goal:"Complete security training", Owner:"Mohan Kumar", "Due date":"Oct 31, 2026", Progress:"100%", Status:"Complete" },
  ],
  documents: [
    { Document:"Employment agreement", Type:"Agreement", Updated:"Jan 03, 2024", Owner:"People team", Status:"Signed" },
    { Document:"Code of conduct", Type:"Policy", Updated:"Oct 15, 2026", Owner:"People team", Status:"Read" },
    { Document:"Benefits enrollment", Type:"Benefits", Updated:"Sep 01, 2026", Owner:"Mohan Kumar", Status:"Action needed" },
  ],
  insurance: [
    { Coverage:"Health insurance", Details:"Family floater · ₹5 lakh", Renewal:"Jan 01, 2027", Status:"Active" },
    { Coverage:"Personal accident", Details:"Group cover · ₹10 lakh", Renewal:"Jan 01, 2027", Status:"Active" },
    { Coverage:"Policy renewal", Details:"Open enrollment window", Renewal:"January 2027", Status:"Upcoming" },
  ],
  connect: [
    { Update:"Welcome our newest teammates!", "Posted by":"People team", Community:"Company-wide", When:"2 hours ago" },
    { Update:"November team lunch 🍕", "Posted by":"Dipti Narayan", Community:"Bengaluru", When:"Yesterday" },
    { Update:"Product launch celebration", "Posted by":"Shailendra Kumar", Community:"Engineering", When:"Oct 26" },
  ],
  settings: [
    { Preference:"Language", "Current setting":"English (India)" },
    { Preference:"Time zone", "Current setting":"Asia/Kolkata" },
    { Preference:"Email notifications", "Current setting":"Enabled" },
    { Preference:"Two-factor authentication", "Current setting":"Enabled" },
  ],
};

export const metrics = {
  dashboard:[{label:"Days present",value:"12",icon:"↗",note:"+2 from last month"},{label:"Leave balance",value:"3.07 days",icon:"◷",note:"Across 3 leave types"},{label:"Pending actions",value:"4",icon:"!",note:"1 attendance anomaly"},{label:"Team members",value:"248",icon:"♧",note:"6 new faces this month"}],
  people:[{label:"People at Kredily",value:"248",icon:"♧",note:"Across 12 departments"},{label:"Departments",value:"12",icon:"▦",note:"Working as one team"},{label:"New this month",value:"6",icon:"✦",note:"Say a warm hello"},{label:"Birthdays this month",value:"8",icon:"♡",note:"A reason to celebrate"}],
  idCard:[{label:"Employee ID",value:"KR-2048",icon:"▣",note:"Your digital work identity"},{label:"Department",value:"IT",icon:"♧",note:"Information Technology"},{label:"Work location",value:"Bengaluru",icon:"⌖",note:"Karnataka, India"},{label:"With Kredily since",value:"2024",icon:"✦",note:"Your story so far"}],
  timesheet:[{label:"Hours this week",value:"37h 20m",icon:"◷",note:"+2h 15m from last week"},{label:"Focused time",value:"32h",icon:"✦",note:"Time in deep work"},{label:"Projects touched",value:"4",icon:"↗",note:"Across 3 teams"},{label:"Weekly goal",value:"93%",icon:"✓",note:"40 hours"}],
  attendance:[{label:"Present this month",value:"12 days",icon:"✓",note:"+2 from last month"},{label:"Average hours",value:"8h 42m",icon:"◷",note:"Your daily average"},{label:"Late arrivals",value:"1",icon:"!",note:"Looking good"},{label:"Attendance score",value:"96%",icon:"✦",note:"A great month so far"}],
  leave:[{label:"Casual leave",value:"0.65 days",icon:"✳",note:"Of 24 annual days"},{label:"Work from home",value:"2.42 days",icon:"⌂",note:"Of 90 annual days"},{label:"Comp off",value:"0 days",icon:"◷",note:"No balance available"},{label:"Requests pending",value:"1",icon:"!",note:"Awaiting a manager"}],
  payroll:[{label:"Next payday",value:"Oct 31",icon:"₹",note:"3 days to go"},{label:"Last net pay",value:"₹ 84,250",icon:"↗",note:"September 2026"},{label:"Annual CTC",value:"₹ 12.6L",icon:"▦",note:"As per latest revision"},{label:"Tax regime",value:"New regime",icon:"✓",note:"For FY 2026–27"}],
  expenses:[{label:"Submitted this month",value:"₹ 4,250",icon:"↗",note:"Across 3 claims"},{label:"Awaiting approval",value:"2 claims",icon:"◷",note:"With your manager"},{label:"Reimbursed",value:"₹ 12,400",icon:"✓",note:"This financial year"},{label:"Available limit",value:"₹ 25,000",icon:"₹",note:"Annual allowance"}],
  performance:[{label:"Current cycle",value:"Q4 2026",icon:"✦",note:"October — December"},{label:"Goals on track",value:"4 of 5",icon:"✓",note:"One needs a check-in"},{label:"Last check-in",value:"Oct 12",icon:"◷",note:"With Shailendra"},{label:"Feedback received",value:"3 notes",icon:"♡",note:"Your team sees you"}],
  documents:[{label:"My documents",value:"8 files",icon:"▤",note:"Your personal library"},{label:"Company policies",value:"12 files",icon:"▦",note:"Always up to date"},{label:"Needs signature",value:"1",icon:"!",note:"One quick action"},{label:"Last updated",value:"Oct 15",icon:"◷",note:"Recently refreshed"}],
  insurance:[{label:"Health cover",value:"₹ 5 lakh",icon:"♡",note:"Family floater"},{label:"Plan",value:"Family floater",icon:"♧",note:"You + 2 dependants"},{label:"Dependants",value:"2 enrolled",icon:"✓",note:"Coverage is active"},{label:"Renewal date",value:"Jan 01",icon:"◷",note:"2027 policy year"}],
  connect:[{label:"Company updates",value:"3 new",icon:"✦",note:"Fresh from your team"},{label:"My communities",value:"4",icon:"♧",note:"Find your people"},{label:"Team celebrations",value:"2 soon",icon:"♡",note:"Don't miss a moment"},{label:"Unread messages",value:"5",icon:"✉",note:"Your team is talking"}],
  settings:[{label:"Profile",value:"Up to date",icon:"✓",note:"Looking good"},{label:"Notifications",value:"On",icon:"♧",note:"You're in the loop"},{label:"Two-factor auth",value:"Enabled",icon:"▣",note:"Your account is secure"},{label:"Workspace",value:"Kredily India",icon:"⌂",note:"Employee workspace"}],
};

export const profile = { Name:"Mohan Kumar", Initials:"MK", Role:"Full Stack Developer", Department:"Information Technology", Location:"Bengaluru, India", EmployeeID:"KR-2048", Joined:"January 2024", Manager:"Shailendra Kumar", Email:"mohan.kumar@kredily.com", color:"avatar-mohan" };

export function idCardProfile() {
  return profile;
}

export function timesheetWeek() {
  return {
    totalHours:"37h 20m",
    days:[
      {short:"Mon",date:"26",hours:"7.8h",percent:76},
      {short:"Tue",date:"27",hours:"9.3h",percent:91},
      {short:"Wed",date:"28",hours:"8h",percent:80,today:true},
      {short:"Thu",date:"29",hours:"—",percent:5},
      {short:"Fri",date:"30",hours:"—",percent:5},
      {short:"Sat",date:"31",hours:"—",percent:3},
      {short:"Sun",date:"1",hours:"—",percent:3},
    ],
  };
}

export function createRecord(module, body) {
  const record = { ...body, Status:body.Status || (module === "leave" ? "Pending" : "In review"), CreatedAt:new Date().toISOString() };
  if (module === "people") {
    record.Initials = String(body.Name || "").trim().split(/\s+/).slice(0,2).map(part=>part[0] || "").join("").toUpperCase();
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
