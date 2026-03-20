import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  if (!user || user.role !== "admin") {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default AdminRoute;
