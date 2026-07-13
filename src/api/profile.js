import client from "./client";

// Reuses the same endpoint the admin's "updateUser" uses (PUT /users/:id).
// Works for self-editing as long as your backend permits a user to update their own record.
export async function updateProfile(userId, data) {
  const response = await client.put(`/users/${userId}`, data);
  return response.data;
}