import { useAuth } from "../hooks/useAuth";
// import { Navigate } from "react-router-dom";
// import { paths } from "./paths";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { loading } = useAuth();

  if (loading) {
    return null; // evita travar telas internas com loading infinito
  }

  // if (!user) return <Navigate to={paths.login} replace />;

  return <>{children}</>;
};
