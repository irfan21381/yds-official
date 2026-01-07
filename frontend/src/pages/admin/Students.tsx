import { useEffect, useState } from "react";
import { getPendingStudents, approveStudent } from "@/api/adminStudents";
import { toast } from "sonner";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const data = await getPendingStudents();
      setStudents(data);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("Student approved");
      loadStudents();
    } catch {
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Students</h1>
      {students.length === 0 ? (
        <p>No pending students</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Email</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td className="border p-2">{s.email}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleApprove(s._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
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
