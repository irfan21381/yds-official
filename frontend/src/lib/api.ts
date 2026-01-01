import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // ✅ 30s (Render cold start safe)
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Network / backend down / cold start
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ERR_NETWORK" ||
      !error.response
    ) {
      console.error("Backend connection error:", error.message);
    }

    // 🔐 Unauthorized → logout (except public pages)
    if (error.response?.status === 401) {
      const publicPaths = [
        "/",
        "/login",
        "/register",
        "/verify-otp",
        "/forgot-password",
      ];

      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
