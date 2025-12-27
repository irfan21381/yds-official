import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios"; // ✅ FIXED IMPORT

type MaterialType = "PDF" | "VIDEO" | "LINK";

interface Material {
  _id: string;
  title: string;
  description?: string;
  type: MaterialType;
  subject?: string;
  createdAt?: string;
}

export default function Materials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get("/student/materials"); // ✅ FIXED
        setMaterials(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading materials...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (materials.length === 0) {
    return <div className="p-6 text-center">No materials available</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Study Materials</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div
            key={material._id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{material.title}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  material.type === "PDF"
                    ? "bg-red-100 text-red-600"
                    : material.type === "VIDEO"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {material.type}
              </span>
            </div>

            {material.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {material.description}
              </p>
            )}

            {material.subject && (
              <p className="text-xs text-gray-500 mb-3">
                Subject: {material.subject}
              </p>
            )}

            <button
              onClick={() =>
                navigate(`/student/materials/${material._id}`)
              }
              className="w-full mt-2 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Open Material
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
