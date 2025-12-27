import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";

// Icons
const UserIcon = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>;
const MailIcon = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>;
const LockIcon = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const CheckIcon = (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg>;
const LoaderIcon = () => <span className="animate-spin">⏳</span>;

// API
import {
  loginWithPassword,
  sendLoginOtp,
  verifyLoginOtp,
} from "@/api/auth";

// Animations
const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

// ✅ FIXED INPUT COMPONENT
type InputFieldProps = {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
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
}: InputFieldProps) => {
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
          onChange={(e) => onChange(e.target.value)} // ✅ FIX
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

export default function Login() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { login } = useAuth();

  const [tab, setTab] = useState<"password" | "otp">("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const showError = (msg: string) => alert(msg);

  // PASSWORD LOGIN
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginWithPassword(email, password);
      login(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(redirectByRole(data.user.role));
    } catch (err: any) {
      showError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // SEND OTP
  const handleSendOtp = async () => {
    if (!otpEmail) return showError("Enter email");
    try {
      await sendLoginOtp(otpEmail);
      setOtpSent(true);
    } catch {
      showError("OTP send failed");
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otpCode) return showError("Enter OTP");
    try {
      const data = await verifyLoginOtp(otpEmail, otpCode);
      login(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(redirectByRole(data.user.role));
    } catch {
      showError("OTP verification failed");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-gray-900" : "bg-gray-100"}`}>
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
      >
        <div className="flex justify-center mb-4">
          <UserIcon className="w-10 h-10 text-blue-500" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Login
        </h2>

        <div className="flex mb-6">
          <button className={`flex-1 p-2 ${tab === "password" && "bg-blue-600 text-white"}`} onClick={() => setTab("password")}>
            Password
          </button>
          <button className={`flex-1 p-2 ${tab === "otp" && "bg-blue-600 text-white"}`} onClick={() => setTab("otp")}>
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
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl">
              {loading ? <LoaderIcon /> : "Login"}
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
              <button onClick={handleSendOtp} className="w-full bg-green-600 text-white p-3 rounded-xl">
                Send OTP
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
                <button onClick={handleVerifyOtp} className="w-full bg-blue-600 text-white p-3 rounded-xl">
                  Verify OTP
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
