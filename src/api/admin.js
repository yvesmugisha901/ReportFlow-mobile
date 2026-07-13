import client from "./client";

export async function getAdminDashboardStats() {
  const response = await client.get("/dashboard/admin");
  return response.data;
}

export async function getPendingUsers() {
  const response = await client.get("/users/pending");
  return response.data; // { users: [...] } or an array, depending on backend
}

export async function approveUser(userId, { teamId } = {}) {
  const response = await client.patch(`/users/${userId}/approve`, {
    team_id: teamId || null,
  });
  return response.data;
}

export async function getTeams(deptId) {
  const response = await client.get("/teams", {
    params: { dept_id: deptId },
  });
  return response.data; // { teams: [...] } or an array
}