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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/student/me");
        // Handling both {data: {user...}} and {user...} formats
        const rawData = res.data?.data || res.data;
        const user = rawData?.user;
        const student = rawData?.student;

        if (!user) throw new Error("User data missing");

        const formatted: StudentProfile = {
          fullName: student?.name || "Student", 
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

  const saveProfile = async () => {
    if (!form) return;
    try {
      const res = await api.put("/student/me", form);
      const rawUpdate = res.data?.data || res.data;
      const studentData = rawUpdate?.student;

      // Optional chaining ensures no crash if studentData is null
      const newProfile: StudentProfile = {
          ...form,
          fullName: studentData?.name || form.fullName,
          collegeName: studentData?.collegeName || form.collegeName,
          whatsapp: studentData?.whatsapp || form.whatsapp,
          city: studentData?.city || form.city,
          nationality: studentData?.nationality || form.nationality,
      };

      setProfile(newProfile);
      setForm(newProfile);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!profile || !form) return <div className="p-10 text-center">No data found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-8">
        <h2 className="text-2xl font-bold dark:text-white">Profile</h2>
        <div className="flex gap-2">
          <button onClick={() => {setEditing(!editing); setForm(profile);}} className="px-4 py-2 border rounded dark:text-white">{editing ? "Cancel" : "Edit"}</button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={form.fullName} disabled={!editing} onChange={(v) => setForm({...form, fullName: v})} />
          <Input label="Email" value={form.email} disabled />
          <Input label="College" value={form.collegeName} disabled={!editing} onChange={(v) => setForm({...form, collegeName: v})} />
          <Input label="WhatsApp" value={form.whatsapp} disabled={!editing} onChange={(v) => setForm({...form, whatsapp: v})} />
          <Input label="City" value={form.city} disabled={!editing} onChange={(v) => setForm({...form, city: v})} />
          <Input label="Nationality" value={form.nationality} disabled={!editing} onChange={(v) => setForm({...form, nationality: v})} />
          {editing && <button onClick={saveProfile} className="md:col-span-2 bg-blue-600 text-white p-3 rounded-lg font-bold">Save Changes</button>}
      </div>
    </div>
  );
}

const Input = ({ label, value, disabled, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    <input value={value} disabled={disabled} onChange={(e) => onChange && onChange(e.target.value)} className="p-3 border rounded-lg dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-950" />
  </div>
);
