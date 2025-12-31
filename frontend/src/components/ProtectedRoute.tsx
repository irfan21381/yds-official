import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: (
    | "SUPER_ADMIN"
    | "MANAGER"
    | "TEACHER"
    | "STUDENT"
    | "PUBLIC_STUDENT"
    | "EMPLOYEE"
  )[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // ⏳ wait till auth init
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 🔒 not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ role not allowed
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
