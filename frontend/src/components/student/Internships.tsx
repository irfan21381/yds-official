import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Internship {
  _id: string;
  title: string;
  description?: string;
  company?: string;
  status?: "APPLIED" | "ONGOING" | "COMPLETED";
}

export default function Internships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await api.get("/student/internships");

        /**
         * 🔥 SAFE RESPONSE NORMALIZATION
         */
        const list =
          Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.internships)
            ? res.data.internships
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        setInternships(list);
      } catch (err) {
        console.error("Failed to load internships", err);
        setError("Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // ---------------- UI STATES ----------------
  if (loading) {
    return <div className="p-6 text-center">Loading internships...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Internships</h2>

      {internships.length === 0 ? (
        <div className="text-center text-gray-500">
          No internships applied yet
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship._id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow"
            >
              <h3 className="font-semibold text-lg">
                {internship.title}
              </h3>

              {internship.company && (
                <p className="text-sm text-gray-500 mt-1">
                  Company: {internship.company}
                </p>
              )}

              {internship.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {internship.description}
                </p>
              )}

              {internship.status && (
                <span
                  className={`inline-block mt-3 px-3 py-1 text-xs rounded-full font-semibold
                    ${
                      internship.status === "APPLIED"
                        ? "bg-yellow-100 text-yellow-700"
                        : internship.status === "ONGOING"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  {internship.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
