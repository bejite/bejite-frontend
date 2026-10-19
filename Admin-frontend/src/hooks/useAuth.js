import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { clearAuthData, getAccessToken, getUser, isAuthenticated } from '../utils/tokenManager';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, errors } = useSelector((state) => state.auth);

  // Get tokens and user from localStorage
  const accessToken = getAccessToken();
  const storedUser = getUser();
  const authenticated = isAuthenticated();

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    clearAuthData();
    navigate('/');
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    const currentUser = user || storedUser;
    return currentUser?.role === role;
  };

  // Check if user is verified
  const isVerified = () => {
    const currentUser = user || storedUser;
    return currentUser?.verified || currentUser?.isEmailVerified || false;
  };

  return {
    user: user || storedUser,
    loading,
    errors,
    accessToken,
    authenticated,
    isVerified: isVerified(),
    hasRole,
    logout: handleLogout,
  };
};

export default useAuth;

