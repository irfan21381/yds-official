import React, { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // 🔥 Prevent multiple toasts
  const authToastShown = useRef(false);
  const roleToastShown = useRef(false);

  /* =========================
     AUTH ERROR (ONLY ONCE)
  ========================= */
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authToastShown.current) {
      toast.error("You need to log in to access this page.");
      authToastShown.current = true;
    }
  }, [isAuthenticated, isLoading]);

  /* =========================
     ROLE ERROR (ONLY ONCE)
  ========================= */
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      allowedRoles &&
      !hasRole(allowedRoles) &&
      !roleToastShown.current
    ) {
      toast.error("You do not have permission to access this page.");
      roleToastShown.current = true;
    }
  }, [isAuthenticated, isLoading, allowedRoles, hasRole]);

  /* =========================
     LOADING
  ========================= */
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  /* =========================
     NOT AUTHENTICATED
  ========================= */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* =========================
     ROLE NOT ALLOWED
  ========================= */
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;