import { useState } from "react";
import { createUser } from "@/api/admin";

export default function AddUserModal({ onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "STUDENT",
  });

  const submit = async () => {
    await createUser(form);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4">Add User</h2>

        <input
          placeholder="Email"
          className="w-full border p-2 mb-3"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full border p-2 mb-4"
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="STUDENT">Student</option>
          <option value="EMPLOYEE">Employee</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}