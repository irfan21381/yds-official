import { api } from "@/lib/api";

// Fetch ONLY pending students (for your current approval workflow)
export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  return res.data;
};

// Fetch ALL users (Students, Employees, Managers) with full data
export const getAllUsers = async () => {
  // This endpoint should return the full user list from your backend
  const res = await api.get("/admin/users/all"); 
  return res.data;
};

// Approval logic
export const approveStudent = async (studentId: string) => {
  const res = await api.patch(`/admin/students/${studentId}/approve`, {});
  return res.data;
};
