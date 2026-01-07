import { api } from "@/lib/api";

/**
 * Fetches all students with "PENDING" status
 */
export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  // Returns res.data directly to the component
  return res.data;
};

/**
 * Approves a specific student by ID
 * @param studentId The unique MongoDB _id of the student
 */
export const approveStudent = async (studentId: string) => {
  // ✅ Added empty object {} as the request body. 
  // Some servers require a body for PATCH requests even if it's empty.
  const res = await api.patch(`/admin/students/${studentId}/approve`, {});
  return res.data;
};
