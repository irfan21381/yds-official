import { useEffect, useState } from "react";
import { getUsers, approveUser } from "@/api/adminUsers";
import { toast } from "sonner";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const res = await getUsers("STUDENT", "PENDING");
      setStudents(res.data);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveUser(id);
      toast.success("Student approved");
      loadStudents();
    } catch {
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pending Students</h1>

      {students.length === 0 && (
        <p>No pending students</p>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.email}</td>
              <td>{s.status}</td>
              <td>
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
    </div>
  );
}
