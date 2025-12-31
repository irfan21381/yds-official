import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import API from "@/lib/api";

/* ================= TYPES ================= */

interface User {
  id: string;
  email: string;
  role:
    | "SUPER_ADMIN"
    | "MANAGER"
    | "TEACHER"
    | "STUDENT"
    | "EMPLOYEE"
    | "PUBLIC_STUDENT";
  collegeId?: string;
  isVerified: boolean;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roles: User["role"][]) => boolean;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= LOGOUT (MUST BE ABOVE useEffect) ================= */

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out.");
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded: any = jwtDecode(storedToken);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        logout();
      } else {
        setToken(storedToken);

        const baseUser: User = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          collegeId: decoded.collegeId,
          isVerified: true,
        };

        setUser(baseUser);
      }
    } catch (error) {
      console.error("JWT decode failed:", error);
      logout();
    }

    setIsLoading(false);
  }, []);

  /* ================= LOGIN ================= */

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    try {
      const decoded: any = jwtDecode(newToken);

      let tempUser: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        collegeId: decoded.collegeId,
        isVerified: true,
      };

      // Fetch student profile only after login
      if (decoded.role === "STUDENT" || decoded.role === "PUBLIC_STUDENT") {
        const res = await API.get("/student/me", {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        tempUser.name = res.data?.data?.student?.name || "Student";
      }

      setUser(tempUser);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error("Login failed. Invalid token.");
      logout();
    }
  };

  /* ================= HELPERS ================= */

  const isAuthenticated = Boolean(user && token);

  const hasRole = (roles: User["role"][]) =>
    isAuthenticated && user ? roles.includes(user.role) : false;

  /* ================= PROVIDER RETURN ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
