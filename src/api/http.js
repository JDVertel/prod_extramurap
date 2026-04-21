import axios from "axios";

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
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("userData");
    }
    return Promise.reject(error);
  }
);

export default http;
