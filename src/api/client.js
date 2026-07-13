import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/config";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (requestConfig) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SecureStore.deleteItemAsync("authToken");
    }
    return Promise.reject(error);
  }
);

// Origin for serving static files (uploads), derived by stripping a trailing "/api"
// e.g. "http://192.168.1.179:5000/api" -> "http://192.168.1.179:5000"
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default client;