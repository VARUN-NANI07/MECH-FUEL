// src/components/auth/AdminRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log("AdminRoute check - isAuthenticated:", isAuthenticated, "user:", user, "role:", user?.role); // Debug log

  if (loading) return null; // or a loader component

  // Check if user is authenticated AND has admin role
  if (!isAuthenticated || user?.role !== "admin") {
    console.log("AdminRoute: Access denied - redirecting to home"); // Debug log
    return <Navigate to="/" replace />;
  }

  console.log("AdminRoute: Access granted"); // Debug log
  // Works with both <AdminRoute><Component/></AdminRoute>
  // and <Route element={<AdminRoute />} />
  return children ? children : <Outlet />;
};

export default AdminRoute;
