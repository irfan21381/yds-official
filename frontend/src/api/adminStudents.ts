import { api } from "@/lib/api";

export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  return res.data;
};

export const approveStudent = async (studentId: string) => {
  const res = await api.patch(`/admin/students/${studentId}/approve`);
  return res.data;
};
