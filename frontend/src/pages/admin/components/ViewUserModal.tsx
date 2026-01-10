import { useEffect, useState } from "react";
import { getUserById } from "@/api/admin";

export default function ViewUserModal({ userId, onClose }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUserById(userId).then((res) => setUser(res.data));
  }, [userId]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4">User Details</h2>

        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
        <p><b>Status:</b> {user.isActive ? "Active" : "Inactive"}</p>

        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}