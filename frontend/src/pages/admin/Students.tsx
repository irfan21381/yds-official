import { useEffect, useState } from "react";
import { getPendingStudents, getAllUsers, approveStudent } from "@/api/adminStudents";
import { toast } from "sonner";
import { Search, CheckCircle, Eye, Trash2, UserPlus } from "lucide-react";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      // Passing searchTerm to the API
      const res = view === "pending" ? await getPendingStudents() : await getAllUsers(searchTerm);
      const actualData = res?.data || res?.users || res;
      setUsers(Array.isArray(actualData) ? actualData : []);
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("Failed to load user data");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to prevent flickering and excessive database calls
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(handler);
  }, [view, searchTerm]);

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("User approved successfully");
      loadData();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500">Fast access to full database records and pending approvals.</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-xl border shadow-inner">
          <button 
            onClick={() => setView("pending")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === "pending" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setView("all")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === "all" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            Full DB
          </button>
        </div>
      </div>

      {/* 🔍 Search functionality */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search students by email or role..." 
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-xs font-bold uppercase text-gray-400 tracking-widest">Account Email</th>
                <th className="p-5 text-xs font-bold uppercase text-gray-400 tracking-widest">Role</th>
                <th className="p-5 text-xs font-bold uppercase text-gray-400 tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center font-medium text-gray-400 animate-pulse">Fast Accessing Database...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">No records found matching your search.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="font-semibold text-gray-800">{u.email}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">UID: {u._id}</div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 text-gray-600 uppercase tracking-tighter group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-center gap-3">
                      {u.status === "PENDING" && (
                        <button 
                          onClick={() => handleApprove(u._id)}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Approve User"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="p-2 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 bg-gray-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
