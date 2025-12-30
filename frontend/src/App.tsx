import { BrowserRouter, Routes, Route } from "react-router-dom";

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Layouts
import MainLayout from "./layout/MainLayout";
import StudentLayout from "./layout/StudentLayout";
import AdminLayout from "./layout/AdminLayout";
import ManagerLayout from "./layout/ManagerLayout";
import TeacherLayout from "./layout/TeacherLayout";
import EmployeeLayout from "./layout/EmployeeLayout";

// Student Pages
import StudentDashboard from "./components/student/Dashboard";
import Profile from "./components/student/Profile";
import Internships from "./components/student/Internships";
import Payments from "./pages/student/Payments";
import Materials from "./pages/Materials";
import MaterialViewer from "./pages/MaterialViewer";
import Courses from "./components/student/Courses";

// Admin Pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PaymentRequests from "./pages/admin/PaymentRequests";

// 🔥 ADMIN COURSE PAGES
import CoursesList from "./admin/pages/courses/CoursesList";
import CreateCourse from "./admin/pages/courses/CreateCourse";
import EditCourse from "./admin/pages/courses/EditCourse";
import CourseContent from "./admin/pages/courses/CourseContent";
import CourseStudents from "./admin/pages/courses/CourseStudents";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ---------------- STUDENT ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT", "PUBLIC_STUDENT"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="courses" element={<Courses />} />
              <Route path="internships" element={<Internships />} />
              <Route path="payments" element={<Payments />} />
              <Route path="materials" element={<Materials />} />
              <Route path="materials/:materialId" element={<MaterialViewer />} />
            </Route>
          </Route>

          {/* ---------------- ADMIN ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="payment-requests" element={<PaymentRequests />} />

              {/* 🔥 COURSES MODULE (FINAL) */}
              <Route path="courses" element={<CoursesList />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/:id" element={<EditCourse />} />
              <Route path="courses/:id/content" element={<CourseContent />} />
              <Route path="courses/:id/students" element={<CourseStudents />} />
            </Route>
          </Route>

          {/* ---------------- MANAGER ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
            </Route>
          </Route>

          {/* ---------------- TEACHER ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
            </Route>
          </Route>

          {/* ---------------- EMPLOYEE ---------------- */}
          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<div>Employee Dashboard</div>} />
              <Route path="dashboard" element={<div>Employee Dashboard</div>} />
            </Route>
          </Route>

          {/* ---------------- FALLBACK ---------------- */}
          <Route
            path="*"
            element={<div className="p-10 text-center">404 | Page Not Found</div>}
          />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}