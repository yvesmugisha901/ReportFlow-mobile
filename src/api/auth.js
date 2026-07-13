import client from "./client";

// NOTE: adjust the route ("/auth/login") and the response shape below
// to match whatever your Express backend actually returns.
// Expected response shape assumed here: { token: "...", user: { id, name, email, role } }

export async function login(email, password) {
  const response = await client.post("/auth/login", { email, password });
  return response.data; // { token, user }
}

export async function getCurrentUser() {
  const response = await client.get("/auth/me");
  return response.data; // { id, name, email, role, department, team }
}

export async function logout() {
  // If your backend has a logout/blacklist endpoint, call it here.
  // Otherwise this can just be a no-op; token removal happens client-side.
  return true;
}
