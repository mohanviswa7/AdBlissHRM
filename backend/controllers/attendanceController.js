import { store } from "../data/store.js";
import { sendJson } from "../utils/http.js";

export function getClock({ response }) {
  sendJson(response, 200, { clockedIn:store.clockedIn, startedAt:store.clockStartedAt });
}

export function toggleClock({ response }) {
  store.clockedIn = !store.clockedIn;
  store.clockStartedAt = store.clockedIn ? new Date().toISOString() : null;
  sendJson(response, 200, {
    clockedIn:store.clockedIn,
    changedAt:new Date().toISOString(),
    startedAt:store.clockStartedAt,
  });
}
