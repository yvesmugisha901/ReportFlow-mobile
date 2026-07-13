import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/config";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach the JWT token to every request automatically, if we have one
client.interceptors.request.use(async (requestConfig) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Handle expired/invalid tokens globally
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SecureStore.deleteItemAsync("authToken");
      // AuthContext listens for this via the logout flow triggered on next auth check
    }
    return Promise.reject(error);
  }
);

export default client;
