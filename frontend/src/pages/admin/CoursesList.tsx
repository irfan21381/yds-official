import { Link } from "react-router-dom";
import { Plus, Users, Edit } from "lucide-react";

import CourseCard from "@/components/superadmin/CourseCard";

{dummyCourses.map((course) => (
  <CourseCard key={course.id} course={course} />
))}

const dummyCourses = [
  {
    id: "1",
    title: "React Fundamentals",
    category: "Web Development",
    level: "Beginner",
    students: 120,
    status: "Published",
  },
];

export default function CoursesList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link
          to="/admin/courses/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Create Course
        </Link>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border p-5 space-y-3"
          >
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <p className="text-sm text-gray-500">
              {course.category} • {course.level}
            </p>

            <div className="flex justify-between text-sm text-gray-600">
              <span>👥 {course.students} students</span>
              <span className="text-green-600">{course.status}</span>
            </div>

            <div className="flex gap-3 pt-3">
              <Link
                to={`/admin/courses/${course.id}`}
                className="flex items-center gap-1 text-blue-600 text-sm"
              >
                <Edit size={14} /> Edit
              </Link>

              <Link
                to={`/admin/courses/${course.id}/students`}
                className="flex items-center gap-1 text-gray-600 text-sm"
              >
                <Users size={14} /> Students
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}