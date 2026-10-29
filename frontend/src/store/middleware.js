
import {
  createListenerMiddleware,
  isRejected,
} from "@reduxjs/toolkit";

import {
  createModuleRecord,
  dismissToast,
  loadModule,
  loadPeopleOverview,
  showToast,
  toggleAttendanceClock,
} from "./hrmSlice.js";

export const hrmListener = createListenerMiddleware();

// Show notifications when records are saved or attendance changes.
hrmListener.startListening({
  matcher: (action) =>
    createModuleRecord.fulfilled.match(action) ||
    toggleAttendanceClock.fulfilled.match(action),

  effect: (action, listenerApi) => {
    const message = createModuleRecord.fulfilled.match(action)
      ? "Saved — your update is ready."
      : action.payload.clockedIn
        ? "You're clocked in. Have a good day!"
        : "You're clocked out. Your hours are saved.";

    listenerApi.dispatch(showToast({ message }));
  },
});

// Show errors for failed requests, except People API requests.
// The People page can display its own loading/error state.
hrmListener.startListening({
  matcher: isRejected,

  effect: (action, listenerApi) => {
    if (
      loadModule.rejected.match(action) ||
      loadPeopleOverview.rejected.match(action)
    ) {
      return;
    }

    const message =
      action.payload?.message ||
      action.error?.message ||
      "That request couldn't be completed.";

    listenerApi.dispatch(showToast({ message }));
  },
});

// Automatically dismiss toast notifications.
hrmListener.startListening({
  actionCreator: showToast,

  effect: async (action, listenerApi) => {
    const id =
      action.payload.id ||
      listenerApi.getState().hrm.toasts.at(-1)?.id;

    await listenerApi.delay(3400);

    if (id) {
      listenerApi.dispatch(dismissToast(id));
    }
  },
});
