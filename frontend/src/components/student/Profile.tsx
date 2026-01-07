import React, { useEffect, useState } from "react";
import { api } from "@/lib/api"; 
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
        const res = await api.get("/student/me");
        const rawData = res.data?.data || res.data;
        const user = rawData?.user;
        const student = rawData?.student;

        if (!user) throw new Error("User data missing");

        const formatted: StudentProfile = {
          // Backend nundi 'name' field ni priority ga tisukuntundi
          fullName: student?.name || student?.fullName || "Student", 
          email: user?.email || "",
          collegeName: student?.collegeName || "",
          whatsapp: student?.whatsapp || "",
          city: student?.city || "",
          nationality: student?.nationality || "Indian",
        };

        setProfile(formatted);
        setForm(formatted);
      } catch (err: any) {
        console.error("Load failed:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Save Profile Update (Crucial Fix)
  const saveProfile = async () => {
    if (!form) return;
    try {
      // 💡 Ikada Backend field names ki map chestunnamu
      const updatePayload = {
        name: form.fullName, // mapping fullName to 'name' for DB
        collegeName: form.collegeName,
        whatsapp: form.whatsapp,
        city: form.city,
        nationality: form.nationality
      };

      const res = await api.put("/student/me", updatePayload);
      const rawUpdate = res.data?.data || res.data;
      const studentData = rawUpdate?.student;

      // Update success ayyaka state ni refresh chestunnamu
      const newProfile: StudentProfile = {
          ...form,
          fullName: studentData?.name || studentData?.fullName || form.fullName,
          collegeName: studentData?.collegeName || form.collegeName,
          whatsapp: studentData?.whatsapp || form.whatsapp,
          city: studentData?.city || form.city,
          nationality: studentData?.nationality || form.nationality,
      };

      setProfile(newProfile);
      setForm(newProfile);
      setEditing(false);
      toast.success("Profile updated in database!");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;
  if (!profile || !form) return <div className="p-10 text-center dark:text-white">No data.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold dark:text-white">My Profile</h2>
        <div className="flex gap-2">
          <button onClick={() => {setEditing(!editing); setForm(profile);}} className="px-4 py-2 border rounded-lg dark:text-white">
            {editing ? "Cancel" : "Edit Profile"}
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={form.fullName} disabled={!editing} onChange={(v: string) => setForm({...form, fullName: v})} />
          <Input label="Email" value={form.email} disabled />
          <Input label="College" value={form.collegeName} disabled={!editing} onChange={(v: string) => setForm({...form, collegeName: v})} />
          <Input label="WhatsApp" value={form.whatsapp} disabled={!editing} onChange={(v: string) => setForm({...form, whatsapp: v})} />
          <Input label="City" value={form.city} disabled={!editing} onChange={(v: string) => setForm({...form, city: v})} />
          <Input label="Nationality" value={form.nationality} disabled={!editing} onChange={(v: string) => setForm({...form, nationality: v})} />
        </div>
        {editing && <button onClick={saveProfile} className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Save Changes</button>}
      </div>
    </div>
  );
}

const Input = ({ label, value, disabled, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-gray-500">{label}</label>
    <input value={value} disabled={disabled} onChange={(e) => onChange && onChange(e.target.value)} className="p-3 border rounded-xl dark:bg-gray-800 dark:text-white disabled:bg-gray-100" />
  </div>
);
