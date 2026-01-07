// src/components/student/Profile.tsx
import React, { useEffect, useState } from "react";
import API from "@/lib/api"; 
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface StudentProfile {
  fullName: string;
  email: string;
  collegeName: string;
  whatsapp: string;
  city: string;
  nationality: string;
}

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<StudentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student/me");
        // Safety check using optional chaining
        const user = res.data?.data?.user;
        const student = res.data?.data?.student;

        if (!user || !student) {
          throw new Error("Invalid data structure from server");
        }

        const formatted: StudentProfile = {
          fullName: student.name || "", 
          email: user.email || "",
          collegeName: student.collegeName || "",
          whatsapp: student.whatsapp || "",
          city: student.city || "",
          nationality: student.nationality || "Indian",
        };

        setProfile(formatted);
        setForm(formatted);
      } catch (err) {
        console.error("Profile load failed:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // 3. Save Profile Update (FIXED SECTION)
  const saveProfile = async () => {
    if (!form) return;

    try {
      const res = await API.put("/student/me", form);
      
      // Screen shot lo unna error ni fix cheyadaniki optional chaining
      const studentData = res.data?.data?.student;

      if (!studentData) {
        // Oka vela response lo student lekapothe form data ne vaadutundi
        toast.warning("Profile saved, but response was empty.");
        setProfile(form);
        setEditing(false);
        return;
      }

      const newProfile: StudentProfile = {
          ...form,
          fullName: studentData.name || form.fullName,
          collegeName: studentData.collegeName || form.collegeName,
          whatsapp: studentData.whatsapp || form.whatsapp,
          city: studentData.city || form.city,
          nationality: studentData.nationality || form.nationality,
      };

      setProfile(newProfile);
      setForm(newProfile);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update failed:", err);
      // Detailed error message from server if available
      const errMsg = err.response?.data?.message || "Update failed. Please try again.";
      toast.error(errMsg);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;
  if (!profile || !form) return <div className="p-6 text-center">Profile data not available.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">My Profile</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing((prev) => !prev);
              setForm(profile); 
            }}
            className="px-4 py-2 border rounded transition hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded bg-red-600 text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={form.fullName} disabled={!editing} onChange={(v) => handleChange("fullName", v)} />
          <Input label="Email" value={form.email} disabled />
          <Input label="College Name" value={form.collegeName} disabled={!editing} onChange={(v) => handleChange("collegeName", v)} />
          <Input label="WhatsApp Number" value={form.whatsapp} disabled={!editing} onChange={(v) => handleChange("whatsapp", v)} />
          <Input label="City" value={form.city} disabled={!editing} onChange={(v) => handleChange("city", v)} />
          <Input label="Nationality" value={form.nationality} disabled={!editing} onChange={(v) => handleChange("nationality", v)} />
        </div>

        {editing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveProfile}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold transition hover:bg-blue-700 shadow-lg"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const Input = ({ label, value, disabled, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</label>
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition ${
        disabled ? "bg-gray-50 cursor-not-allowed opacity-75" : "bg-white"
      }`}
    />
  </div>
);
