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

// ─── Teams ──────────────────────────────────────────────────────
export async function getTeams(deptId) {
  const response = await client.get("/teams", {
    params: deptId ? { dept_id: deptId } : undefined,
  });
  return response.data.teams;
}

export async function createTeam({ name, dept_id }) {
  const response = await client.post("/teams", { name, dept_id });
  return response.data.team;
}

// ─── Departments ────────────────────────────────────────────────
export async function getAllDepartments() {
  const response = await client.get("/departments");
  return response.data.departments;
}

export async function getDepartmentById(deptId) {
  const response = await client.get(`/departments/${deptId}`);
  return response.data.department;
}

export async function createDepartment({ name, description, reviewer_id }) {
  const response = await client.post("/departments", { name, description, reviewer_id });
  return response.data.department;
}

// ─── Users ──────────────────────────────────────────────────────
export async function getAllUsers(params = {}) {
  const response = await client.get("/users", { params });
  return response.data.users;
}

export async function getUserById(userId) {
  const response = await client.get(`/users/${userId}`);
  return response.data.user;
}

// role: "admin" | "employee" | "reviewer" | "approver"
// Backend auto-generates a password and emails it — no password field needed here.
export async function registerUser({ full_name, email, role, dept_id, team_id }) {
  const response = await client.post("/users", {
    full_name,
    email,
    role,
    dept_id: dept_id || null,
    team_id: team_id || null,
  });
  return response.data; // { success, user, plainPassword, emailPreview, emailError? }
}

export async function updateUser(userId, updates) {
  const response = await client.put(`/users/${userId}`, updates);
  return response.data.user;
}

export async function deactivateUser(userId) {
  const response = await client.patch(`/users/${userId}/deactivate`);
  return response.data;
}

export async function activateUser(userId) {
  const response = await client.patch(`/users/${userId}/activate`);
  return response.data;
}