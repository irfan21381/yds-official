import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { verifyLoginOtp, sendLoginOtp } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // ✅ Email from Register page
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🛑 If user directly opens page
  if (!email) {
    navigate("/register");
    return null;
  }

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerify = async () => {
    if (!otp) return toast.error("Enter OTP");
    if (loading) return;

    setLoading(true);
    try {
      const data = await verifyLoginOtp(email, otp);
      await login(data.token);

      toast.success("Account verified & logged in");
      navigate(redirectByRole(data.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
  ========================= */
  const handleResend = async () => {
    try {
      await sendLoginOtp(email);
      toast.success("OTP resent to email");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Verify OTP
        </h2>

        <p className="text-sm text-center mb-4 text-gray-500">
          OTP sent to <b>{email}</b>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 rounded-xl border mb-4 dark:bg-gray-700 dark:text-white"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl mb-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResend}
          className="w-full text-sm text-blue-600"
        >
          Resend OTP
        </button>
      </motion.div>
    </div>
  );
}
