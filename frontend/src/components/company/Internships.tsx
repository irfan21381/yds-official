import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useReveal from "../../hooks/useReveal";
import { api } from "@/lib/api";

interface Internship {
  _id: string;
  title: string;
  duration: string;
  mode: string;
}

export default function HomeInternships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const navigate = useNavigate();

  // ✅ Hook used ONCE (correct)
  const revealRef = useReveal("animate-zoom");

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await api.get("/internships");
      setInternships(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
    } catch (err) {
      console.error("Failed to load internships");
    }
  };

  return (
    <section id="internships" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900">
          Active Internships
        </h2>

        {internships.length === 0 ? (
          <p className="text-center mt-6 text-gray-500">
            Internships will be announced soon
          </p>
        ) : (
          <div
            ref={revealRef as any}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            {internships.map((it) => (
              <div
                key={it._id}
                className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold">{it.title}</h3>
                <p className="text-slate-600 mt-1">
                  Duration: {it.duration}
                </p>
                <p className="text-slate-600">
                  Mode: {it.mode}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => navigate("/internships")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    View & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
