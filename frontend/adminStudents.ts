import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPendingStudents,
  approveStudent,
} from "@/api/adminStudents";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const res = await getPendingStudents();
      setStudents(res.data || []);
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Pending Student Requests
      </h1>

      {students.length === 0 ? (
        <p>No pending students</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Registered At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleApprove(s._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
