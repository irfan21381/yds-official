import { useEffect, useState } from "react";

// ❌ DO NOT use "@/api/admin" (causes white screen in production)
// ✅ Use relative path
import { getAllUsers, deleteUser } from "../../api/admin";

import { Eye, Trash2, Plus } from "lucide-react";
import AddUserModal from "./components/AddUserModal";
import ViewUserModal from "./components/ViewUserModal";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("ALL");
  const [viewId, setViewId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  /* =========================
     LOAD USERS (SAFE)
  ========================= */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();

      // backend returns { success, count, data }
      setUsers(res?.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]); // prevent white screen
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================
     FILTER BY ROLE
  ========================= */
  const filteredUsers =
    role === "ALL"
      ? users
      : users.filter((u) => u.role === role);

  /* =========================
     DELETE USER (SAFE)
  ========================= */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">User Management</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* ================= ROLE FILTER ================= */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {["ALL", "STUDENT", "EMPLOYEE", "SUPER_ADMIN"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-1 rounded-full text-sm transition ${
              role === r
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Email</th>
              <th>Role</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-4">
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-gray-500">
                      UID: {u._id}
                    </div>
                  </td>

                  <td>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {u.role}
                    </span>
                  </td>

                  <td className="flex justify-center gap-3 py-4">
                    <button
                      onClick={() => setViewId(u._id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="View user"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODALS ================= */}
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={loadUsers}
        />
      )}

      {viewId && (
        <ViewUserModal
          userId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
}