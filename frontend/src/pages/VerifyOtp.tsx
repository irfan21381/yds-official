// src/pages/VerifyOtp.tsx
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

  const email = location.state?.email;

  // 🛑 Block direct access
  if (!email) {
    navigate("/login");
    return null;
  }

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);
    try {
      const data = await verifyLoginOtp(email, otp);
      await login(data.token);

      toast.success("Admin verified successfully");
      navigate(redirectByRole(data.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await sendLoginOtp(email);
    toast.success("OTP resent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-xl font-bold text-center mb-4">
          Admin OTP Verification
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white p-3 rounded mb-2"
        >
          Verify OTP
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
