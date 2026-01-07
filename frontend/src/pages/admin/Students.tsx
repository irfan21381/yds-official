import { useEffect, useState } from "react";
// 1. Updated names to match your api/adminStudents.ts file
import { getPendingStudents, approveStudent } from "@/api/adminStudents";
import { toast } from "sonner";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      // 2. Using the correct function name. 
      // Note: Since your API file returns 'res.data', we use the result directly.
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
      // 3. Using the correct function name
      await approveStudent(id);
      toast.success("Student approved");
      // Refresh the list
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border p-2">{s.email}</td>
                  <td className="border p-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleApprove(s._id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
