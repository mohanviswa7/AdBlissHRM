import { store } from "../data/store.js";
import { loadNotifications } from "../services/kredilyService.js";
import { sendJson } from "../utils/http.js";

// Read state for Kredily notifications is kept in memory per user.
const externalReads = new Map();

function externalReadIds(userId) {
  if (!externalReads.has(userId)) externalReads.set(userId, new Set());
  return externalReads.get(userId);
}

function markLocalRead(notification, userId) {
  notification.readBy ||= [];
  if (!notification.readBy.includes(userId)) notification.readBy.push(userId);
}

export async function listNotifications({ response, session }) {
  let notifications;
  try {
    const readIds = externalReadIds(session.user.id);
    notifications = (await loadNotifications()).map((notification) => ({
      ...notification,
      read:readIds.has(notification.id),
    }));
  } catch (error) {
    console.error("Notifications API request failed:", error);
    notifications = store.notifications.map((notification) => ({
      ...notification,
      read:Boolean(notification.readBy?.includes(session.user.id)),
    }));
  }
  sendJson(response, 200, {
    notifications,
    unreadCount:notifications.filter((notification) => !notification.read).length,
  });
}

export function markRead({ response, session, params }) {
  const [id] = params;
  const local = store.notifications.find((entry) => entry.id === id);
  if (local) markLocalRead(local, session.user.id);
  else externalReadIds(session.user.id).add(id);
  sendJson(response, 200, { message:"Notification marked as read." });
}

export async function markAllRead({ response, session }) {
  for (const notification of store.notifications) markLocalRead(notification, session.user.id);
  try {
    const readIds = externalReadIds(session.user.id);
    for (const notification of await loadNotifications()) readIds.add(notification.id);
  } catch (error) {
    console.error("Notifications API request failed:", error);
  }
  sendJson(response, 200, { message:"All notifications marked as read." });
}
