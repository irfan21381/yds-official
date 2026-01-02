// src/api/auth.ts
import { api } from "@/lib/api";

/* =========================
   LOGIN
========================= */
export const loginWithPassword = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const sendLoginOtp = async (email: string) => {
  const res = await api.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyLoginOtp = async (email: string, otp: string) => {
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
};

/* =========================
   REGISTER
========================= */
export const registerStudent = async (payload: any) => {
  // payload: { name, email, phone, college, department, year, password, isPublicStudent }
  const res = await api.post("/auth/register", payload);
  return res.data;
};

/* =========================
   FORGOT PASSWORD FLOW
========================= */
export const sendForgotPasswordOtp = async (email: string) => {
  const res = await api.post("/auth/send-otp", { email });
  return res.data;
};

export const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const res = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return res.data;
};

/* =========================
   FORCE CHANGE PASSWORD
   (USED AFTER TEMP LOGIN)
========================= */
export const forceChangePassword = async (
  userId: string,
  newPassword: string
) => {
  const res = await api.post("/auth/force-change-password", {
    userId,
    newPassword,
  });
  return res.data;
};
