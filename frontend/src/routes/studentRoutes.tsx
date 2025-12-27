import { Routes, Route } from "react-router-dom";
import StudentLayout from "@/layout/StudentLayout";

import Dashboard from "@/pages/StudentDashboard";
import Profile from "@/pages/ProfilePage";
import Courses from "@/pages/student/Courses";
import Materials from "@/pages/Materials";
import MaterialViewer from "@/pages/MaterialViewer";
import Quizzes from "@/pages/QuizPage";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="courses" element={<Courses />} />
        <Route path="materials" element={<Materials />} />
        <Route path="materials/:materialId" element={<MaterialViewer />} />
        <Route path="quizzes" element={<Quizzes />} />
      </Route>
    </Routes>
  );
}
