import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  canAccessPath,
  getDefaultAdminPath,
} from "../../constants/adminPermissions";

const AdminProtectedRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/" replace />;
  }

  const currentPath = location.pathname;
  // Layout shell at /admin is always allowed; page access checked for nested paths
  if (
    currentPath !== "/admin" &&
    !canAccessPath(user.admin_role, currentPath)
  ) {
    return <Navigate to={getDefaultAdminPath(user.admin_role)} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
