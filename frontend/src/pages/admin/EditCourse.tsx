 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseForm from "@/components/superadmin/CourseForm";
export default function EditCourse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "React Fundamentals",
    description: "Learn React step by step",
    category: "Web Development",
    level: "Beginner",
    status: "Published",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("UPDATED COURSE:", form);
    navigate("/admin/courses");
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Edit Course</h1>

      <CourseForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}