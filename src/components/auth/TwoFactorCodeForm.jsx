import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function TwoFactorCodeForm({
  onSubmit,
  loading,
  error,
  onBack,
  onRequestRecovery,
  recoveryLoading,
  submitLabel = "Verify",
}) {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        placeholder="6-digit code or backup code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="w-full px-4 py-3 border border-[#d3d3d3] rounded-xl outline-none shadow-sm text-center tracking-widest focus:ring-2 focus:ring-[#16730F] focus:border-[#16730F]"
        maxLength={16}
        autoFocus
      />
      {error && (
        <p role="alert" className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!code.trim() || loading}
        className={`w-full py-4 rounded-full text-white font-semibold shadow-md transition ${
          !code.trim() || loading
            ? "bg-[#16730F40] cursor-not-allowed"
            : "bg-[#16730F]"
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          submitLabel
        )}
      </button>
      {onRequestRecovery && (
        <button
          type="button"
          onClick={onRequestRecovery}
          disabled={recoveryLoading || loading}
          className="w-full text-sm text-[#16730F] hover:underline disabled:opacity-50"
        >
          {recoveryLoading
            ? "Sending recovery email..."
            : "Can't access your authenticator? Email me a disable link"}
        </button>
      )}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          Back to sign in
        </button>
      )}
    </form>
  );
}
