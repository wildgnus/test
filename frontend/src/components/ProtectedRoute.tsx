import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  managerOnly?: boolean;
}

export function ProtectedRoute({ children, managerOnly = false }: Props) {
  const { isAuthenticated, isManager } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
