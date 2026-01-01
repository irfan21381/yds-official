import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { registerStudent } from "@/api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (k: string, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        email: form.email,
        password: form.password,
        role: "STUDENT",
        isPublicStudent: true,
      });

      toast.success("Registration successful! Verify OTP to continue.");

      // 🔥 IMPORTANT: Go to Verify OTP (not login)
      navigate("/verify-otp", {
        state: { email: form.email },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/90 dark:bg-gray-900 border shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Student Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-md border"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-md border"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-md border"
              value={form.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="text-sm text-center">
            Already registered?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

