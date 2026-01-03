import { api } from "@/lib/api";

/* =========================
   COLLEGE MANAGEMENT
========================= */

// Create a new college
export const createCollege = async (name: string) => {
  const response = await api.post("/admin/college", { name });
  return response.data;
};

// Assign a manager to a college
export const assignManager = async (
  collegeId: string,
  managerEmail: string
) => {
  const response = await api.post(
    `/admin/college/${collegeId}/manager`,
    { managerEmail }
  );
  return response.data;
};

// Activate or deactivate a college
export const activateDeactivateCollege = async (
  collegeId: string,
  isActive: boolean
) => {
  const response = await api.patch(
    `/admin/college/${collegeId}/activate`,
    { isActive }
  );
  return response.data;
};

// Get list of all colleges
export const getAllColleges = async () => {
  const response = await api.get("/admin/colleges");
  return response.data;
};

/* =========================
   ANALYTICS
========================= */

// Get admin dashboard stats
export const getGlobalAnalytics = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

/* =========================
   STUDENT APPROVAL FLOW ✅
========================= */

// Get all pending students
export const getPendingStudents = async () => {
  const response = await api.get("/admin/students/pending");
  return response.data;
};

// Approve a student account
export const approveStudent = async (userId: string) => {
  const response = await api.post(
    `/admin/students/${userId}/approve`
  );
  return response.data;
};

/* =========================
   USER MANAGEMENT (OPTIONAL)
========================= */

// Get users by role (STUDENT / MANAGER / TEACHER / EMPLOYEE)
export const getUsersByRole = async (role: string) => {
  const response = await api.get(`/admin/users?role=${role}`);
  return response.data;
};
