import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import axiosPublic from "../services/axiosPublic";
import Header from "../components/Header";
import {
  isPasswordPolicyValid,
  PASSWORD_POLICY_MESSAGE,
} from "../utils/passwordPolicy";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPasswordValid = isPasswordPolicyValid(password);

  const isDisabled =
    !password ||
    !confirmPassword ||
    password !== confirmPassword ||
    !isPasswordValid;

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) return;

    try {
      setLoading(true);

      await axiosPublic.patch(
        "/auth/reset-Pword",
        { token, password },
        { headers: { "Content-Type": "application/json" } },
      );

      toast.success("Password reset successful! You can now log in.");
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Password reset failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <Header />

      <div className="flex flex-col items-center justify-center w-full px-4 mt-6 sm:mt-16 flex-1">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl sm:text-3xl font-norican font-semibold text-[#16730F] text-center">
            Reset Your Password
          </h2>
          <p className="text-center text-[#333] text-sm sm:text-base">
            Enter your new password below to complete the reset.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#1A3E32] rounded-xl focus:outline-1 focus:outline-[#1A3E32] placeholder-[#1A3E32]"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                  console.log("Toggled password visibility:", !showPassword);
                }}
                className="absolute text-gray-500 transform -translate-y-1/2 right-4 top-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#1A3E32] rounded-xl focus:outline-1 focus:outline-[#1A3E32] placeholder-[#1A3E32]"
            />
            <button
              type="button"
              onClick={() => {
                setShowConfirmPassword(!showConfirmPassword);
                console.log("Toggled password visibility:", !showPassword);
              }}
              className="absolute text-gray-500 transform -translate-y-1/2 right-4 top-1/2"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>

             {/* Password warnings */}
            {!isPasswordValid && password && (
              <p className="text-red-500 text-sm">{PASSWORD_POLICY_MESSAGE}</p>
            )}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={isDisabled || loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition shadow-md ${
                isDisabled || loading
                  ? "bg-[#1A3E32] cursor-not-allowed"
                  : "bg-[#16730F]"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
