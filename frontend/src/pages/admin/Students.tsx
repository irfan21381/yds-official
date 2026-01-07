import { useEffect, useState } from "react";
import { getPendingStudents, approveStudent } from "@/api/adminStudents";
import { toast } from "sonner";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await getPendingStudents();
      
      // DEBUG: This helps you see the structure in the browser console
      console.log("API Data:", response);

      /**
       * SAFE DATA MAPPING:
       * Handles cases where the API returns the array directly, 
       * or wrapped in an object like { data: [] } or { students: [] }
       */
      if (Array.isArray(response)) {
        setStudents(response);
      } else if (response && Array.isArray(response.students)) {
        setStudents(response.students);
      } else if (response && Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("Student approved");
      // Refresh the list after approval
      await loadStudents();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading pending students...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pending Student Approvals</h1>
        <button 
          onClick={loadStudents}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      {students.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded border border-blue-100">
          No students are currently awaiting approval.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">Student Email</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-700">{student.email}</td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full uppercase font-medium">
                      {student.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleApprove(student._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
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
