import { readFile } from "node:fs/promises";
import { readJson, sendJson } from "../utils/http.js";

const dataFile = new URL("../data/directoryEmployees.json", import.meta.url);

// Maps a directory filter key to the employee field it matches.
const filterFields = {
  department: "department__dept_name",
  designation: "current_designation__designation_name",
  grade: "grade__name",
  location: "work_location__title",
  manager_name: "manager_name",
  signed_in_status: "signed_in_status",
  sub_department: "sub_department__sub_dept_name",
  employee_type_display: "employee_type_display",
  employee_status_display: "employee_status_display",
};

function fullName(employee) {
  return [employee.first_name, employee.middle_name, employee.last_name].map((part) => (part || "").trim()).filter(Boolean).join(" ");
}

function matchesFilters(employee, filters) {
  return Object.entries(filters).every(([key, wanted]) => {
    const values = (Array.isArray(wanted) ? wanted : [wanted]).filter((value) => value !== "" && value != null);
    if (!values.length) return true;
    if (key === "search") return values.some((value) => fullName(employee).toLowerCase().includes(String(value).toLowerCase()));
    const field = filterFields[key];
    return field ? values.includes(employee[field]) : true;
  });
}

// POST /api/company/directory/employees  { page, page_size, filters }
export async function listDirectoryEmployees({ request, response }) {
  const body = await readJson(request);
  const page = Math.max(1, Number.parseInt(body.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(body.page_size, 10) || 24));
  const filters = body.filters && typeof body.filters === "object" ? body.filters : {};

  const payload = JSON.parse(await readFile(dataFile, "utf8"));
  const matched = payload.data.employees.filter((employee) => matchesFilters(employee, filters));
  const totalRecords = Object.keys(filters).length ? matched.length : payload.data.pagination.total_records;
  const start = (page - 1) * pageSize;

  sendJson(response, 200, {
    ...payload,
    data: {
      ...payload.data,
      employees: matched.slice(start, start + pageSize),
      pagination: { page, page_size: pageSize, total_records: totalRecords, total_pages: Math.ceil(totalRecords / pageSize) },
    },
  });
}
