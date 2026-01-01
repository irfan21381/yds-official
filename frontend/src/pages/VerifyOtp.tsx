import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // email can come from register/login page via state
  const email = (location.state as any)?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email missing. Please login again.");
      navigate("/login");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Enter 6 digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      const token = res.data?.token;
      if (!token) {
        toast.error("Verification failed");
        return;
      }

      // 🔥 Save token + load user
      await login(token);

      toast.success("OTP verified successfully!");

      // 🔀 Role-based redirect
      const role = res.data?.user?.role;
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "MANAGER") navigate("/manager");
      else if (role === "TEACHER") navigate("/teacher");
      else navigate("/student");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Invalid or expired OTP"
      );
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
        <h2 className="text-2xl font-semibold text-center mb-2">
          Verify OTP
        </h2>

        <p className="text-sm text-center text-gray-600 mb-6">
          Enter the 6-digit OTP sent to  
          <br />
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center tracking-[0.4em] text-2xl p-4 rounded-lg border bg-white dark:bg-gray-800"
            placeholder="______"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          Didn’t receive OTP?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Resend OTP
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
