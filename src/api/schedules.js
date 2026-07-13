import client from "./client";

export async function getMySchedules() {
  const response = await client.get("/schedules");
  return response.data.schedules;
}

// Alias for compatibility with existing screens that import getSchedules
export const getSchedules = getMySchedules;

export async function getScheduleById(scheduleId) {
  const response = await client.get(`/schedules/${scheduleId}`);
  return response.data.schedule;
}