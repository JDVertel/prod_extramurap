import axios from "axios";
import router from "@/router";
import { clearAuthStorage } from "@/utils/authSession";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage();
      if (router.currentRoute.value?.path !== "/login") {
        router.replace({ name: "login", query: { reason: "session_expired" } });
      }
    }
    return Promise.reject(error);
  }
);

export default http;
