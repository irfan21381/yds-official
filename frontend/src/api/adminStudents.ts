// src/api/adminStudents.ts
import { api } from "@/lib/api";

// Change name to getUsers
export const getUsers = async (role?: string, status?: string) => {
  const res = await api.get("/admin/students/pending");
  return res; // Note: Ensure this returns the 'res' object if your component expects res.data
};

// Change name to approveUser
export const approveUser = async (studentId: string) => {
  const res = await api.patch(`/admin/students/${studentId}/approve`);
  return res.data;
};
