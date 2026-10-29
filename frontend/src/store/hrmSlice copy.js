import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/,"");

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...options?.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

export const loadModule = createAsyncThunk("hrm/loadModule", async (id) => {
  let endpoint = `/modules/${id}`;
  if (id === "dashboard") endpoint = "/dashboard";
  if (id === "id-card") endpoint = "/id-card";
  if (id === "timesheet") endpoint = "/timesheet";
  const data = await request(endpoint);
  return { id, data };
});

export const loadPeopleDirectory = createAsyncThunk("hrm/loadPeopleDirectory", async (_, { signal }) =>
  request("/people/directory", { signal }),
);

export const loadPeopleOverview = createAsyncThunk("hrm/loadPeopleOverview", async (_, { signal }) =>
  request("/people/overview", { signal }),
);

export const loadPeopleApiConfig = createAsyncThunk("hrm/loadPeopleApiConfig", async (_, { signal }) =>
  request("/people/config", { signal }),
);

export const createModuleRecord = createAsyncThunk("hrm/createModuleRecord", async ({ id, record }) => {
  const result = await request(`/modules/${id}`, {
    method: "POST",
    body: JSON.stringify(record),
  });
  return { id, ...result };
});

export const toggleAttendanceClock = createAsyncThunk("hrm/toggleAttendanceClock", async () =>
  request("/attendance/clock", { method: "POST", body: "{}" }),
);

const initialState = {
  activePage: "dashboard",
  modules: {},
  clockedIn: true,
  loading: {},
  errors: {},
  peopleApiConfig: { directoryAuthorized: null, overviewAuthorized: null, loading: false, error: null },
  peopleDirectory: { records: null, loading: false, error: null },
  peopleOverview: { data: null, loading: false, error: null },
  toasts: [],
  quickLinks: [],
};

const hrmSlice = createSlice({
  name: "hrm",
  initialState,
  reducers: {
    setActivePage(state, action) {
      state.activePage = action.payload;
    },
    showToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(payload) {
        return { payload: { id: payload.id || `${Date.now()}-${Math.random()}`, message: payload.message } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    updateQuickLinks(state, action) {
      state.quickLinks = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadModule.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
        delete state.errors[action.meta.arg];
      })
      .addCase(loadModule.fulfilled, (state, action) => {
        state.loading[action.payload.id] = false;
        state.modules[action.payload.id] = action.payload.data;
        if (action.payload.id === "dashboard") state.clockedIn = action.payload.data.clockedIn;
      })
      .addCase(loadModule.rejected, (state, action) => {
        state.loading[action.meta.arg] = false;
        state.errors[action.meta.arg] = action.error.message || "Unable to load this page.";
      })
      .addCase(loadPeopleApiConfig.pending, (state) => {
        state.peopleApiConfig.loading = true;
        state.peopleApiConfig.error = null;
      })
      .addCase(loadPeopleApiConfig.fulfilled, (state, action) => {
        state.peopleApiConfig.loading = false;
        state.peopleApiConfig.directoryAuthorized = action.payload.directoryAuthorized;
        state.peopleApiConfig.overviewAuthorized = action.payload.overviewAuthorized;
      })
      .addCase(loadPeopleApiConfig.rejected, (state, action) => {
        state.peopleApiConfig.loading = false;
        if (!action.meta.aborted) {
          state.peopleApiConfig.error = action.error.message || "Unable to check directory API configuration.";
        }
      })
      .addCase(loadPeopleDirectory.pending, (state) => {
        state.peopleDirectory.loading = true;
        state.peopleDirectory.error = null;
      })
      .addCase(loadPeopleDirectory.fulfilled, (state, action) => {
        state.peopleDirectory.loading = false;
        state.peopleDirectory.records = action.payload.records;
      })
      .addCase(loadPeopleDirectory.rejected, (state, action) => {
        state.peopleDirectory.loading = false;
        if (!action.meta.aborted) {
          state.peopleDirectory.error = action.error.message || "Unable to load the employee directory.";
        }
      })
      .addCase(loadPeopleOverview.pending, (state) => {
        state.peopleOverview.loading = true;
        state.peopleOverview.error = null;
      })
      .addCase(loadPeopleOverview.fulfilled, (state, action) => {
        state.peopleOverview.loading = false;
        state.peopleOverview.data = action.payload.overview;
      })
      .addCase(loadPeopleOverview.rejected, (state, action) => {
        state.peopleOverview.loading = false;
        if (!action.meta.aborted) {
          state.peopleOverview.error = action.error.message || "Unable to load new joiners.";
        }
      })
      .addCase(createModuleRecord.fulfilled, (state, action) => {
        const { id, record } = action.payload;
        const module = state.modules[id] || { records: [] };
        state.modules[id] = { ...module, records: [record, ...(module.records || [])] };
      })
      .addCase(toggleAttendanceClock.fulfilled, (state, action) => {
        state.clockedIn = action.payload.clockedIn;
        if (state.modules.dashboard) state.modules.dashboard.clockedIn = action.payload.clockedIn;
      });
  },
});

export const { dismissToast, setActivePage, showToast, updateQuickLinks } = hrmSlice.actions;
export default hrmSlice.reducer;
