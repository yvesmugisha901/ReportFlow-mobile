import client from "./client";

// Returns schedules relevant to the current user (backend should filter by dept/team/role)
export async function getSchedules() {
  const response = await client.get("/schedules");
  return response.data;
}