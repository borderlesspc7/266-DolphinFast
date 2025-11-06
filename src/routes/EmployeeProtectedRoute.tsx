import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import { isEmployee } from "../types/user";
import type { ReactNode } from "react";

interface EmployeeProtectedRouteProps {
  children: ReactNode;
}

export const EmployeeProtectedRoute = ({
  children,
}: EmployeeProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#64748b",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  // Se for cliente (user), redireciona para o perfil
  if (!isEmployee(user.role)) {
    return <Navigate to={paths.profile} replace />;
  }

  return <>{children}</>;
};

