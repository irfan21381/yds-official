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
      const data = view === "pending" ? await getPendingStudents() : await getAllUsers();
      
      // Safe data mapping
      if (Array.isArray(data)) setUsers(data);
      else if (data?.data) setUsers(data.data);
      else if (data?.users) setUsers(data.users);
      else setUsers([]);
    } catch (err) {
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [view]);

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("User approved successfully");
      loadData();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Manage approvals and view complete user data</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === "pending" ? "bg-white shadow text-blue-600" : "text-gray-600"}`}
          >
            Pending Approvals
          </button>
          <button 
            onClick={() => setView("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === "all" ? "bg-white shadow text-blue-600" : "text-gray-600"}`}
          >
            All Users (Full Data)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading database...</div>
      ) : (
        <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                {view === "all" && <th className="p-4 font-semibold text-gray-600">Password (Hashed)</th>}
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">{u.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  {view === "all" && (
                    <td className="p-4 font-mono text-xs text-gray-400 truncate max-w-[150px]">
                      {u.password || "••••••••"}
                    </td>
                  )}
                  <td className="p-4 text-right">
                    {u.status === "PENDING" && (
                      <button 
                        onClick={() => handleApprove(u._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    <button className="ml-2 text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-10 text-center text-gray-500">No users found in this category.</p>}
        </div>
      )}
    </div>
  );
}
