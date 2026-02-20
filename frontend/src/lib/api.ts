import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://yds-official.onrender.com";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
