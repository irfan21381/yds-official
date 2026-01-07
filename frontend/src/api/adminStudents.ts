import { api } from "@/lib/api";

export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  return res.data;
};

export const approveStudent = async (studentId: string) => {
  // Added an empty object {} as the body, which some APIs require for PATCH
  const res = await api.patch(`/admin/students/${studentId}/approve`, {});
  return res.data;
};
