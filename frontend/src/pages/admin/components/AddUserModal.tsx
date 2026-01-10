import { useState } from "react";

// ❌ DO NOT use "@/api/admin"
// ✅ Use RELATIVE PATH
import { createUser } from "../../../api/admin";

export default function AddUserModal({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createUser(form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Create user failed:", err);
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] max-w-[90%]">
        <h2 className="text-xl font-bold mb-4">Add User</h2>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <input
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3 rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full border p-2 mb-4 rounded"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="STUDENT">Student</option>
          <option value="EMPLOYEE">Employee</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}