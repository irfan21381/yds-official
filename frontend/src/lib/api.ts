import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://yds-backend.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false, // 🔥 MUST BE FALSE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
