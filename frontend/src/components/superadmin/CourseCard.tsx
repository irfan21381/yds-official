 import { Link } from "react-router-dom";
import { Users, Edit, Layers } from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  students: number;
  status: string;
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white border rounded-xl p-5 space-y-3">
      <h2 className="font-semibold text-lg">{course.title}</h2>

      <p className="text-sm text-gray-500">
        {course.category} • {course.level}
      </p>

      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1">
          <Users size={14} /> {course.students}
        </span>
        <span className="text-green-600">{course.status}</span>
      </div>

      <div className="flex gap-4 pt-2 text-sm">
        <Link to={`/admin/courses/${course.id}`} className="text-blue-600 flex gap-1">
          <Edit size={14} /> Edit
        </Link>

        <Link
          to={`/admin/courses/${course.id}/content`}
          className="text-gray-600 flex gap-1"
        >
          <Layers size={14} /> Content
        </Link>
      </div>
    </div>
  );
}