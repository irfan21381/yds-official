// src/components/student/Profile.tsx
import React, { useEffect, useState } from "react";
import API from "@/lib/api"; 
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/** Defines the structure of the data displayed/edited in the form. */
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

  // 1. Fetch Profile Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student/me");
        
        // Debugging kosam (Console lo check cheyandi data ela undo)
        console.log("Profile Data:", res.data);

        // Flexible mapping: Backend data 'res.data.data' lo unna leda 'res.data' lo unna handle chestundi
        const rawData = res.data?.data || res.data;
        const user = rawData?.user;
        const student = rawData?.student;

        if (!user) {
          throw new Error("User information not found in server response");
        }

        const formatted: StudentProfile = {
          fullName: student?.name || "No Name Provided", 
          email: user?.email || "",
          collegeName: student?.collegeName || "",
          whatsapp: student?.whatsapp || "",
          city: student?.city || "",
          nationality: student?.nationality || "Indian",
        };

        setProfile(formatted);
        setForm(formatted);
      } catch (err: any) {
        console.error("Profile load failed:", err);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Handle Form Changes
  const handleChange = (field: keyof StudentProfile, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // 3. Save Profile Update (FIXED WITH OPTIONAL CHAINING)
  const saveProfile = async () => {
    if (!form) return;

    try {
      const res = await API.put("/student/me", form);
      
      const rawUpdateData = res.data?.data || res.data;
      const studentData = rawUpdateData?.student;

      // Update success ayina tharuvatha local state ni update chestunnam
      const updatedProfile: StudentProfile = {
          ...form,
          fullName: studentData?.name || form.fullName,
          collegeName: studentData?.collegeName || form.collegeName,
          whatsapp: studentData?.whatsapp || form.whatsapp,
          city: studentData?.city || form.city,
          nationality: studentData?.nationality || form.nationality,
      };

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update failed:", err);
      const serverMessage = err.response?.data?.message || "Update failed. Please try again.";
      toast.error(serverMessage);
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading profile...</div>;
  if (!profile || !form) return <div className="p-10 text-center dark:text-white">Profile data not available.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Profile Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditing((prev) => !prev);
              setForm(profile); 
            }}
            className="px-5 py-2.5 text-sm font-semibold border rounded-lg transition hover:bg-gray-50 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>

          <button
            onClick={logout}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white transition hover:bg-red-700 shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input label="Full Name" value={form.fullName} disabled={!editing} onChange={(v) => handleChange("fullName", v)} />
          <Input label="Email Address" value={form.email} disabled />
          <Input label="College Name" value={form.collegeName} disabled={!editing} onChange={(v) => handleChange("collegeName", v)} />
          <Input label="WhatsApp Number" value={form.whatsapp} disabled={!editing} onChange={(v) => handleChange("whatsapp", v)} />
          <Input label="City" value={form.city} disabled={!editing} onChange={(v) => handleChange("city", v)} />
          <Input label="Nationality" value={form.nationality} disabled={!editing} onChange={(v) => handleChange("nationality", v)} />
        </div>

        {editing && (
          <div className="mt-10 flex justify-end">
            <button
              onClick={saveProfile}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold transition hover:bg-blue-700 shadow-lg active:scale-95"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Input Component
const Input = ({ label, value, disabled, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`w-full p-3.5 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
        disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white hover:border-blue-400"
      }`}
    />
  </div>
);
