import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPendingStudents, approveStudent } from "@/api/admin";

interface Student {
  _id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getPendingStudents();
      setStudents(data.students || []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("Student approved");
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Approval failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Students</h1>

      {loading && <p>Loading...</p>}

      {!loading && students.length === 0 && (
        <p className="text-gray-500">No pending students</p>
      )}

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex justify-between items-center border p-4 rounded-lg"
          >
            <div>
              <p className="font-semibold">{student.email}</p>
              <p className="text-sm text-gray-500">
                Applied on{" "}
                {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => handleApprove(student._id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
