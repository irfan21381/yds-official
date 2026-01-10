import { useEffect, useState } from "react";

// ❌ DO NOT use "@/api/admin"
// ✅ Use RELATIVE PATH
import { getUserById } from "../../../api/admin";

export default function ViewUserModal({ userId, onClose }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getUserById(userId);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] max-w-[90%]">
        <h2 className="text-xl font-bold mb-4">User Details</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <p className="mb-2">
              <b>Email:</b> {user.email}
            </p>
            <p className="mb-2">
              <b>Role:</b> {user.role}
            </p>
            <p className="mb-2">
              <b>Status:</b>{" "}
              {user.isActive ? "Active" : "Inactive"}
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}