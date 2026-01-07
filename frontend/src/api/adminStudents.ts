import { api } from "@/lib/api";

export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/admin/users/all");
  return res.data;
};

export const approveStudent = async (studentId: string) => {
  // ✅ Adding empty object prevents some server/CORS errors with PATCH
  const res = await api.patch(`/admin/students/${studentId}/approve`, {});
  return res.data;
};
