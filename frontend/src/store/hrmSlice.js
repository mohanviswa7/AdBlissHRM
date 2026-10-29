import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...options?.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

function postJson(path, body) {
  return request(path, { method: "POST", body: JSON.stringify(body) });
}

export const checkSession = createAsyncThunk(
  "hrm/checkSession",
  async () => request("/auth/session"),
);

export const signIn = createAsyncThunk("hrm/signIn", async (credentials) =>
  postJson("/auth/login", credentials),
);

export const signUp = createAsyncThunk("hrm/signUp", async (account) =>
  postJson("/auth/signup", account),
);

export const requestOneTimeCode = createAsyncThunk(
  "hrm/requestOneTimeCode",
  async (email) => postJson("/auth/otp/request", { email }),
);

export const verifyOneTimeCode = createAsyncThunk(
  "hrm/verifyOneTimeCode",
  async (credentials) => postJson("/auth/otp/verify", credentials),
);

export const signOut = createAsyncThunk("hrm/signOut", async () =>
  postJson("/auth/logout", {}),
);

export const requestPasswordReset = createAsyncThunk(
  "hrm/requestPasswordReset",
  async (email) => postJson("/auth/forgot-password", { email }),
);

export const resetPassword = createAsyncThunk(
  "hrm/resetPassword",
  async (details) => postJson("/auth/reset-password", details),
);

export const changePassword = createAsyncThunk(
  "hrm/changePassword",
  async (details) => postJson("/auth/change-password", details),
);

export const loadNotifications = createAsyncThunk(
  "hrm/loadNotifications",
  async () => request("/notifications"),
);

export const markNotificationRead = createAsyncThunk(
  "hrm/markNotificationRead",
  async (id) => {
    const result = await request(`/notifications/${id}/read`, { method:"PATCH" });
    return { id, ...result };
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "hrm/markAllNotificationsRead",
  async () => request("/notifications/read-all", { method:"POST", body:"{}" }),
);

export const loadModule = createAsyncThunk("hrm/loadModule", async (id) => {
  let endpoint = `/modules/${id}`;
  if (id === "dashboard") endpoint = "/dashboard";
  if (id === "holidays") endpoint = "/dashboard/attendance-birthday-anniversaries-holidays";
  if (id === "id-card") endpoint = "/id-card";
  if (id === "timesheet") endpoint = "/timesheet";
  const data = await request(endpoint);
  return { id, data };
});

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
  toasts: [],
  quickLinks: [],
  auth: { status:"checking", user:null },
  notifications: [],
  unreadNotifications: 0,
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
      .addCase(createModuleRecord.fulfilled, (state, action) => {
        const { id, record } = action.payload;
        const module = state.modules[id] || { records: [] };
        state.modules[id] = { ...module, records: [record, ...(module.records || [])] };
      })
      .addCase(toggleAttendanceClock.fulfilled, (state, action) => {
        state.clockedIn = action.payload.clockedIn;
        if (state.modules.dashboard) state.modules.dashboard.clockedIn = action.payload.clockedIn;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.auth.status = action.payload.authenticated ? "authenticated" : "anonymous";
        state.auth.user = action.payload.user;
      })
      .addCase(checkSession.rejected, (state) => {
        state.auth.status = "anonymous";
        state.auth.user = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.auth.status = "authenticated";
        state.auth.user = action.payload.user;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.auth.status = "authenticated";
        state.auth.user = action.payload.user;
      })
      .addCase(verifyOneTimeCode.fulfilled, (state, action) => {
        state.auth.status = "authenticated";
        state.auth.user = action.payload.user;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.auth.status = "anonymous";
        state.auth.user = null;
        state.modules = {};
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.auth.status = "anonymous";
        state.auth.user = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadNotifications = action.payload.unreadCount;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (entry) => entry.id === action.payload.id,
        );
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          read:true,
        }));
        state.unreadNotifications = 0;
      });
  },
});

export const { dismissToast, setActivePage, showToast, updateQuickLinks } = hrmSlice.actions;
export default hrmSlice.reducer;
