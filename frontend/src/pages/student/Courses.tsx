import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Course {
  _id: string;
  name: string;
  description?: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // ✅ CORRECT BACKEND ENDPOINT
        const res = await api.get("/student/subjects");
        setCourses(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Courses</h2>

      {courses.length === 0 ? (
        <div className="text-center text-gray-500">
          No courses assigned yet
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{course.name}</h3>

              {course.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {course.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
