import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...options?.headers },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error ||
        result.message ||
        `Request failed (${response.status}).`
    );
  }

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

async function loadPeoplePreview(errorMessage) {
  let preview = { records: [] };
  let previewError = "";
  try {
    preview = await request("/modules/people");
  } catch (error) {
    previewError =
      error.message || "The local employee preview could not be loaded.";
  }

  return {
    records: Array.isArray(preview.records) ? preview.records : [],
    metrics: preview.metrics || [],
    source: preview.records?.length ? "preview" : "kredily",
    error: [errorMessage, previewError].filter(Boolean).join(" "),
  };
}

// Load data for a selected HRM module.
export const loadModule = createAsyncThunk(
  "hrm/loadModule",
  async (id) => {
    let endpoint = `/modules/${id}`;

    if (id === "dashboard") endpoint = "/dashboard";
    if (id === "holidays") endpoint = "/dashboard/attendance-birthday-anniversaries-holidays";
  if (id === "id-card") endpoint = "/id-card";
    if (id === "timesheet") endpoint = "/timesheet";

    if (id === "people") {
      try {
        const records = [];
        let page = 1;
        let totalPages = 1;
        do {
          const result = await request("/company/directory/employees", {
            method: "POST",
            body: JSON.stringify({ page, page_size: 100, filters: {} }),
          });
          records.push(...(result.data?.employees || []));
          totalPages = result.data?.pagination?.total_pages || 1;
          page += 1;
        } while (page <= totalPages);
        return { id, data: { records, source: "kredily", count: records.length } };
      } catch (error) {
        return {
          id,
          data: await loadPeoplePreview(
            error.message || "Unable to load the employee directory.",
          ),
        };
      }
    }

    try {
      const data = await request(endpoint);
      return { id, data };
    } catch (error) {
      if (id === "people") {
        return {
          id,
          data: await loadPeoplePreview(
            error.message || "Unable to load the employee directory.",
          ),
        };
      }

      throw error;
    }
  }
);

// Load new joiners and celebrations from the overview endpoint.
export const loadPeopleOverview = createAsyncThunk(
  "hrm/loadPeopleOverview",
  async () => {
    try {
      const config = await request("/people/config");
      if (!config.overviewAuthorized) {
        return {
          data: null,
          error:
            "Kredily overview authorization is not configured. Add the approved authorization value to backend/.env.",
        };
      }

      const data = await request("/people/overview");

      return {
        data,
        error: null,
      };
    } catch (error) {
      // Overview failure should not prevent the People page from opening.
      return {
        data: null,
        error:
          error.message ||
          "Unable to load new joiners and celebrations.",
      };
    }
  }
);

// Create a record for a module.
export const createModuleRecord = createAsyncThunk(
  "hrm/createModuleRecord",
  async ({ id, record }) => {
    const result = await request(`/modules/${id}`, {
      method: "POST",
      body: JSON.stringify(record),
    });

    return { id, ...result };
  }
);

// Update attendance clock status.
export const toggleAttendanceClock = createAsyncThunk(
  "hrm/toggleAttendanceClock",
  async () =>
    request("/attendance/clock", {
      method: "POST",
      body: JSON.stringify({}),
    })
);

const initialState = {
  activePage: "dashboard",
  modules: {},

  peopleOverview: {
    data: null,
    loading: false,
    error: null,
  },

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
        return {
          payload: {
            id:
              payload.id ||
              `${Date.now()}-${Math.random()}`,
            message: payload.message,
          },
        };
      },
    },

    dismissToast(state, action) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },

    updateQuickLinks(state, action) {
      state.quickLinks = action.payload;
    },
  },

  extraReducers(builder) {
    builder
      // Module loading
      .addCase(loadModule.pending, (state, action) => {
        const id = action.meta.arg;

        state.loading[id] = true;
        delete state.errors[id];
      })

      .addCase(loadModule.fulfilled, (state, action) => {
        const { id, data } = action.payload;

        state.loading[id] = false;
        state.modules[id] = data;

        if (id === "dashboard") {
          state.clockedIn = data.clockedIn;
        }

        delete state.errors[id];
      })

      .addCase(loadModule.rejected, (state, action) => {
        const id = action.meta.arg;

        state.loading[id] = false;
        state.errors[id] =
          action.error.message || "Unable to load this page.";
      })

      // People overview loading
      .addCase(loadPeopleOverview.pending, (state) => {
        state.peopleOverview.loading = true;
        state.peopleOverview.error = null;
      })

      .addCase(loadPeopleOverview.fulfilled, (state, action) => {
        state.peopleOverview.loading = false;
        state.peopleOverview.data = action.payload.data;
        state.peopleOverview.error = action.payload.error;
      })

      .addCase(loadPeopleOverview.rejected, (state, action) => {
        state.peopleOverview.loading = false;
        state.peopleOverview.error =
          action.error.message ||
          "Unable to load the directory overview.";
      })

      // Add a new module record
      .addCase(createModuleRecord.fulfilled, (state, action) => {
        const { id, record } = action.payload;
        const module = state.modules[id] || { records: [] };

        state.modules[id] = {
          ...module,
          records: [record, ...(module.records || [])],
        };
      })

      // Attendance clock update
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

export const {
  dismissToast,
  setActivePage,
  showToast,
  updateQuickLinks,
} = hrmSlice.actions;

export default hrmSlice.reducer;
