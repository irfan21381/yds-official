import { useEffect, useState } from "react";
import { getPendingStudents, getAllUsers, approveStudent } from "@/api/adminStudents";
import { toast } from "sonner";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = view === "pending" ? await getPendingStudents() : await getAllUsers();
      
      // Safety mapping: Handles { success: true, data: [...] } or direct array
      const actualData = res?.data || res?.users || res;

      if (Array.isArray(actualData)) {
        setUsers(actualData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("Failed to load user data");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view]);

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("User approved successfully");
      loadData();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Accessing Database...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Review pending requests or browse full system records.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg border">
          <button 
            onClick={() => setView("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === "pending" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            Pending Approvals
          </button>
          <button 
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === "all" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            Full Database
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">User Email</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                {view === "all" && <th className="p-4 font-semibold text-gray-600">Hashed Password</th>}
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-700">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.status || 'PENDING'}
                    </span>
                  </td>
                  {view === "all" && (
                    <td className="p-4 font-mono text-[10px] text-gray-400 truncate max-w-[180px]">
                      {u.password || "HIDDEN"}
                    </td>
                  )}
                  <td className="p-4 text-right space-x-2">
                    {u.status === "PENDING" && (
                      <button 
                        onClick={() => handleApprove(u._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition"
                      >
                        Approve
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium underline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic">
            No user records found for this view.
          </div>
        )}
      </div>
    </div>
  );
}
