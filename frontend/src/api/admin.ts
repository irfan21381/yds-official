import { api } from "@/lib/api";

/* =========================
   USER MANAGEMENT
========================= */

export const getAllUsers = async (search = "") => {
  const res = await api.get("/admin/users", {
    params: { search },
  });
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const createUser = async (data: {
  email: string;
  password: string;
  role: "STUDENT" | "EMPLOYEE";
}) => {
  const res = await api.post("/admin/users", data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

/* =========================
   COLLEGE MANAGEMENT
========================= */

export const createCollege = async (name: string) => {
  const res = await api.post("/admin/college", { name });
  return res.data;
};

export const assignManager = async (
  collegeId: string,
  managerId: string
) => {
  const res = await api.post(
    `/admin/college/${collegeId}/manager`,
    { managerId }
  );
  return res.data;
};

export const activateDeactivateCollege = async (
  collegeId: string,
  isActive: boolean
) => {
  const res = await api.patch(
    `/admin/college/${collegeId}/activate`,
    { isActive }
  );
  return res.data;
};

export const getAllColleges = async () => {
  const res = await api.get("/admin/colleges");
  return res.data;
};

/* =========================
   ANALYTICS
========================= */

export const getGlobalAnalytics = async () => {
  const res = await api.get("/admin/analytics");
  return res.data;
};

/* =========================
   STUDENT APPROVAL
========================= */

export const getPendingStudents = async () => {
  const res = await api.get("/admin/students/pending");
  return res.data;
};

export const approveStudent = async (userId: string) => {
  const res = await api.patch(
    `/admin/students/${userId}/approve`
  );
  return res.data;
};