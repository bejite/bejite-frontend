import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/tokenManager';
import { toast } from 'react-toastify';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute = ({ children, requireVerified = false, requiredRole = null, redirectMessage = null }) => {
  const authenticated = isAuthenticated();
  const user = getUser();

  // Check if user is authenticated
  if (!authenticated) {
    if (redirectMessage) {
      toast.error(redirectMessage);
    } else {
      toast.error('Please log in to access this page');
    }
    return <Navigate to="/" replace />;
  }

  // Check if email verification is required
  if (requireVerified && user) {
    const isVerified = user.verified || user.isEmailVerified;
    if (!isVerified) {
      toast.warning('Please verify your email to access this page');
      return <Navigate to={`/auth/email-sent?email=${encodeURIComponent(user.email)}`} replace />;
    }
  }

  // Check if specific role is required
  if (requiredRole && user) {
    if (user.role !== requiredRole) {
      toast.error('You do not have permission to access this page');
      return <Navigate to="/resume" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

