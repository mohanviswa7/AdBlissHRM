const directoryApiUrl = () => process.env.KREDILY_DIRECTORY_API_URL || "https://blissdigitalmedia.ai.kredily.com/kapi/v1/company/directory/employees/";
const overviewApiUrl = () => process.env.KREDILY_DIRECTORY_OVERVIEW_API_URL || "https://app.ai.kredily.com/kapi/v1/company/directory/overview/";

const directoryAuthorization = () => process.env.KREDILY_DIRECTORY_AUTHORIZATION;
const overviewAuthorization = () => process.env.KREDILY_OVERVIEW_AUTHORIZATION || directoryAuthorization();

export function getDirectoryConfig() {
  return {
    directoryAuthorized:Boolean(directoryAuthorization()),
    overviewAuthorized:Boolean(overviewAuthorization()),
  };
}

async function fetchKredilyApi(url, { method = "GET", authorization } = {}) {
  const headers = { accept:"application/json" };
  if (authorization) headers.authorization = authorization;
  if (method === "POST") headers["content-type"] = "application/json";

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(method === "POST" ? { body:"{}" } : {}),
      signal:AbortSignal.timeout(15000),
    });
  } catch (error) {
    const message = error.name === "TimeoutError" ? "Kredily directory request timed out." : "Could not reach the Kredily directory API.";
    throw Object.assign(new Error(message), { status:502 });
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.detail || body.error || "";
    } catch {
      // The upstream may return a non-JSON error body.
    }
    const formattedDetail = String(detail).replace(/\.$/, "");
    const message = response.status === 403 || response.status === 401
      ? `${response.status} access denied${formattedDetail ? `: ${formattedDetail}` : ""}. Configure the relevant Kredily authorization value in backend/.env.`
      : `Kredily directory API request failed (${response.status})${formattedDetail ? `: ${formattedDetail}` : ""}.`;
    throw Object.assign(new Error(message), { status:502 });
  }

  try {
    return await response.json();
  } catch {
    throw Object.assign(new Error("Kredily directory API returned invalid JSON."), { status:502 });
  }
}

export async function loadDirectoryOverview() {
  return fetchKredilyApi(overviewApiUrl(), { authorization:overviewAuthorization() });
}

export async function loadDirectoryEmployees() {
  const directory = await fetchKredilyApi(directoryApiUrl(), { method:"POST", authorization:directoryAuthorization() });
  const records = [
    directory,
    directory?.employees,
    directory?.records,
    directory?.results,
    directory?.data,
    directory?.data?.employees,
    directory?.data?.records,
    directory?.data?.results,
  ].find(Array.isArray);
  if (!records) {
    throw Object.assign(new Error("Employee directory API response did not contain an employee list."), { status:502 });
  }
  return records;
}
