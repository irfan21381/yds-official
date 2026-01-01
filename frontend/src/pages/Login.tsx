import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";
import {
  loginWithPassword,
  sendLoginOtp,
  verifyLoginOtp,
} from "@/api/auth";

/* =========================
   ICONS
========================= */
const UserIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="7" r="4" />
    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
  </svg>
);

const MailIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const LockIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Loader = () => <span className="animate-spin">⏳</span>;

/* =========================
   INPUT COMPONENT
========================= */
type InputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: any;
  disabled?: boolean;
};

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
}: InputProps) => {
  const { dark } = useTheme();

  return (
    <div>
      <label className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 p-3 rounded-xl border outline-none ${
            dark
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-black border-gray-300"
          }`}
        />
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  );
};

/* =========================
   LOGIN PAGE
========================= */
export default function Login() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { login } = useAuth();

  const [tab, setTab] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);

  // Password login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP login
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  /* =========================
     PASSWORD LOGIN
  ========================= */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPassword(email, password);
      await login(data.token);

      toast.success("Logged in successfully");
      navigate(redirectByRole(data.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SEND OTP
  ========================= */
  const handleSendOtp = async () => {
    if (!otpEmail) return toast.error("Enter email");
    if (loading) return;

    setLoading(true);
    try {
      await sendLoginOtp(otpEmail);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOtp = async () => {
    if (!otpCode) return toast.error("Enter OTP");
    if (loading) return;

    setLoading(true);
    try {
      const data = await verifyLoginOtp(otpEmail, otpCode);
      await login(data.token);

      toast.success("OTP verified. Logged in!");
      navigate(redirectByRole(data.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
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
          <UserIcon className="w-10 h-10 text-blue-500" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Login
        </h2>

        <div className="flex mb-6">
          <button
            className={`flex-1 p-2 ${
              tab === "password" && "bg-blue-600 text-white"
            }`}
            onClick={() => setTab("password")}
          >
            Password
          </button>
          <button
            className={`flex-1 p-2 ${
              tab === "otp" && "bg-blue-600 text-white"
            }`}
            onClick={() => setTab("otp")}
          >
            OTP
          </button>
        </div>

        {tab === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={MailIcon}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={LockIcon}
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-xl"
            >
              {loading ? <Loader /> : "Login"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={otpEmail}
              onChange={setOtpEmail}
              placeholder="you@example.com"
              icon={MailIcon}
              disabled={otpSent}
            />

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full p-3 rounded-xl text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600"
                }`}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <InputField
                  label="OTP"
                  type="text"
                  value={otpCode}
                  onChange={setOtpCode}
                  placeholder="123456"
                  icon={CheckIcon}
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-xl"
                >
                  {loading ? <Loader /> : "Verify OTP"}
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-sm text-center mt-6">
          New user?{" "}
          <Link to="/register" className="text-blue-500 font-semibold">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
