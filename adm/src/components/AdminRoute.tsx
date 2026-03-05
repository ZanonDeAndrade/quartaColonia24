import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando autenticacao...</div>;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (!isAdmin) {
    return <div className="p-6 text-sm font-medium text-red-600">Acesso negado</div>;
  }

  return <Outlet />;
};
