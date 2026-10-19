import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmTwoFactorRecovery } from "../../services/twoFactorApi";

export default function TwoFactorRecovery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const data = await confirmTwoFactorRecovery(token);
      toast.success(data.message || "Two-factor authentication disabled.");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "This recovery link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-white px-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <h2 className="text-3xl font-norican font-semibold text-[#16730F]">
          Disable Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600">
          This will turn off 2FA so you can sign in with your password. Set 2FA
          up again from Account Settings after you log in.
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!token || loading}
          className={`w-full py-4 rounded-full text-white font-semibold shadow-md transition ${
            !token || loading
              ? "bg-[#16730F40] cursor-not-allowed"
              : "bg-[#16730F]"
          }`}
        >
          {loading ? "Disabling..." : "Disable 2FA and continue"}
        </button>
        {!token && (
          <p className="text-sm text-red-500">This recovery link is missing a token.</p>
        )}
      </div>
    </div>
  );
}
