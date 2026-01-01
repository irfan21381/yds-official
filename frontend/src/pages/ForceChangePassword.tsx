import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";
import { forceChangePassword } from "@/api/auth";

/* =========================
   ICON
========================= */
const LockIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Loader = () => <span className="animate-spin">⏳</span>;

export default function ForceChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark } = useTheme();
  const { login } = useAuth();

  const userId = (location.state as any)?.userId;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    toast.error("Invalid access");
    navigate("/login");
    return null;
  }

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!password || !confirmPassword) {
      toast.error("All fields required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await forceChangePassword(userId, password);

      // ✅ Login after password update
      await login(res.token);

      toast.success("Password updated successfully");
      navigate(redirectByRole(res.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        dark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
      >
        <div className="flex justify-center mb-4">
          <LockIcon className="w-10 h-10 text-blue-500" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-blue-600">
          Change Password
        </h2>

        <p className="text-sm text-center mb-6 text-gray-500">
          You are using a temporary password.  
          Please set a new password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none ${
              dark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none ${
              dark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-300"
            }`}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl"
          >
            {loading ? <Loader /> : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
