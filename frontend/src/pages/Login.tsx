import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";
import { loginWithPassword } from "@/api/auth";

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
};

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword(email, password);

      // 🔥 TEMP PASSWORD FLOW
      if (res.mustChangePassword) {
        toast.info("Please change your password");
        navigate("/force-change-password", {
          state: { userId: res.userId },
        });
        return;
      }

      // ✅ NORMAL LOGIN
      await login(res.token);
      toast.success("Login successful");
      navigate(redirectByRole(res.user.role));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
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

        <form onSubmit={handleLogin} className="space-y-4">
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

        <p className="text-sm text-center mt-6">
          New user?{" "}
          <Link to="/register" className="text-blue-500 font-semibold">
            Contact Admin
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
