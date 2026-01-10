import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
} from "@/api/admin";
import { Eye, Trash2, Plus } from "lucide-react";
import AddUserModal from "./components/AddUserModal";
import ViewUserModal from "./components/ViewUserModal";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("ALL");
  const [viewId, setViewId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered =
    role === "ALL"
      ? users
      : users.filter((u) => u.role === role);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        {["ALL", "STUDENT", "EMPLOYEE", "SUPER_ADMIN"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-1 rounded-full ${
              role === r
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Email</th>
              <th>Role</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-4">
                    <div>{u.email}</div>
                    <div className="text-xs text-gray-500">
                      UID: {u._id}
                    </div>
                  </td>
                  <td>{u.role}</td>
                  <td className="flex justify-center gap-3 py-4">
                    <button
                      onClick={() => setViewId(u._id)}
                      className="p-2 bg-blue-100 rounded"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete user?")) {
                          deleteUser(u._id).then(loadUsers);
                        }
                      }}
                      className="p-2 bg-red-100 rounded"
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