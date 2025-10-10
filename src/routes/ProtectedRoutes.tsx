import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) return <Navigate to={paths.login} replace />;

  return <>{children}</>;
};
