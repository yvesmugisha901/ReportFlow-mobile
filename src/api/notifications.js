import client from "./client";

export async function getMyNotifications() {
  const response = await client.get("/notifications");
  return response.data; // { success, unreadCount, notifications }
}

export async function getUnreadCount() {
  const response = await client.get("/notifications/unread-count");
  return response.data.unread_count;
}

export async function markAsRead(notifId) {
  const response = await client.patch(`/notifications/${notifId}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await client.patch("/notifications/mark-all-read");
  return response.data;
}

export async function deleteNotification(notifId) {
  const response = await client.delete(`/notifications/${notifId}`);
  return response.data;
}

export async function deleteAllRead() {
  const response = await client.delete("/notifications/read");
  return response.data;
}

export async function registerPushToken(expoPushToken) {
  const response = await client.post("/notifications/register-device", {
    token: expoPushToken,
  });
  return response.data;
}