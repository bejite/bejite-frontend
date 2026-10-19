import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  clearErrors,
  logout,
  setAdminAuth,
} from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { getDefaultAdminPath } from "../../constants/adminPermissions";

const bejiteLogoUrl = "/assets/images/logo.png";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDisabled = !username.trim() || !password || loading;

  useEffect(() => {
    dispatch(clearErrors());
    dispatch(logout());
  }, [dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/admin-auth/login", {
        username: username.trim(),
        password,
      });

      if (!data?.accessToken || !data?.admin) {
        toast.error("Unexpected response from server. Please try again.");
        return;
      }

      dispatch(
        setAdminAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          admin: data.admin,
        }),
      );

      toast.success(data.message || "Admin login successful! Redirecting...");
      const destination = getDefaultAdminPath(data.admin?.admin_role);
      setTimeout(() => {
        navigate(destination);
      }, 500);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full flex justify-center py-6 bg-white shadow-sm border-b">
        <img src={bejiteLogoUrl} alt="Logo" className="h-10" />
      </div>

      <div className="flex-1 flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
            <p className="text-gray-500 mt-2">
              Login to access the analytics dashboard
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
            data-testid="admin-login-form"
          >
            <div>
              <label
                htmlFor="admin-username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                data-testid="admin-login-username"
                autoComplete="username"
                placeholder="Your admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                data-testid="admin-login-password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#16730F] focus:ring-1 focus:ring-[#16730F] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 right-4 top-10"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formError && (
              <p
                data-testid="admin-login-error"
                role="alert"
                className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-lg"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              data-testid="admin-login-submit"
              disabled={isDisabled}
              className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-md transition ${
                isDisabled
                  ? "bg-[#16730F]/50 cursor-not-allowed"
                  : "bg-[#16730F] hover:bg-[#115a0c]"
              }`}
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
