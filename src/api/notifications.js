import client from "./client";

export async function getMyNotifications() {
  const response = await client.get("/notifications");
  return response.data;
}

export async function markNotificationRead(notificationId) {
  const response = await client.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

// Register this device's Expo push token with the backend so it can
// send push notifications when reports are submitted/reviewed/approved.
export async function registerPushToken(expoPushToken) {
  const response = await client.post("/notifications/register-device", {
    token: expoPushToken,
  });
  return response.data;
}
