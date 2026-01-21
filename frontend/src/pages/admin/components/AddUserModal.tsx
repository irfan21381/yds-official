import { useState } from "react";

// ✅ Use RELATIVE PATH ONLY
import { createUser } from "../../../api/admin";

type UserRole = "STUDENT" | "EMPLOYEE";

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateUserForm {
  email: string;
  password: string;
  role: UserRole;
}

export default function AddUserModal({
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const [form, setForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createUser(form);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Create user failed:", err);
      setError("Failed to create user. Please try again.");
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
          type="email"
          placeholder="Email"
          autoFocus
          disabled={loading}
          className="w-full border p-2 mb-3 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          disabled={loading}
          className="w-full border p-2 mb-3 rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <select
          disabled={loading}
          className="w-full border p-2 mb-4 rounded"
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value as UserRole,
            })
          }
        >
          <option value="STUDENT">Student</option>
          <option value="EMPLOYEE">Employee</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
