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

// ─── Admin-only schedule management ───────────────────────────
// frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom"
// start_date / deadline: "YYYY-MM-DD" strings (DATEONLY on the backend)
// dept_id / team_id: null = company-wide
export async function createSchedule({ title, report_type, frequency, start_date, deadline, dept_id, team_id }) {
  const response = await client.post("/schedules", {
    title,
    report_type,
    frequency,
    start_date,
    deadline,
    dept_id: dept_id || null,
    team_id: team_id || null,
  });
  return response.data.schedule;
}

export async function updateSchedule(scheduleId, updates) {
  const response = await client.put(`/schedules/${scheduleId}`, updates);
  return response.data.schedule;
}

export async function deleteSchedule(scheduleId) {
  const response = await client.delete(`/schedules/${scheduleId}`);
  return response.data;
}