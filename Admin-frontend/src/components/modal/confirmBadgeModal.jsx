import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Mic,
  Copy,
  Shield,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  setupTwoFactor,
} from "../../services/twoFactorApi";
import { changePasswordRequest } from "../../services/passwordApi";
import {
  isPasswordPolicyValid,
  PASSWORD_POLICY_MESSAGE,
} from "../../utils/passwordPolicy";
import useAuth from "../../hooks/useAuth";

export const ConfirmBadgeModal = ({
  plan,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1A3E32]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-[#1A3E32]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Confirm Subscription
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {plan.label} — {plan.currency}
            {plan.price}
            {plan.period}
          </p>
        </div>
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          You'll be billed{" "}
          <strong>
            {plan.currency}
            {plan.price}
          </strong>
          {plan.period}. Cancel anytime from Account Settings.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-60"
          >
            {isLoading ? "Processing..." : "Subscribe"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export function EventModal({ event, onClose, onRegister, canRegister = true }) {
  const [registered, setRegistered] = useState(Boolean(event?.isRegistered));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!onRegister) return;
    setLoading(true);
    setError(null);
    try {
      await onRegister(event.id);
      setRegistered(true);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Cover */}
        <div className="relative h-44">
          <img
            src={event.coverImg}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${event.color} opacity-60`}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white text-lg font-light backdrop-blur-sm"
          >
            ×
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center text-white text-sm font-bold border-2 border-white`}
            >
              {event.hostAvatar}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{event.host}</p>
              <p className="text-white/80 text-xs">{event.hostTitle}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#1A3E32]" />
                {event.date}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#1A3E32]" />
                {event.time}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#1A3E32]" />
                {event.location}
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Users className="w-3.5 h-3.5 text-[#1A3E32]" />
                {event.seatsLeft} seats left
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {registered ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  You're registered!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Check your email for the event link and calendar invite.
                </p>
              </div>
            </div>
          ) : !canRegister ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              Verified Badge subscription required to register for this event.
            </div>
          ) : (
            <>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3.5 bg-[#1A3E32] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#16362a] transition-colors disabled:opacity-60"
              >
                <Mic className="w-4 h-4" />
                {loading ? "Registering..." : "Reserve My Spot"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  danger,
  onClose,
  onConfirm,
  children,
  isLoading = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${danger ? "bg-red-100" : "bg-[#1A3E32]/10"}`}
        >
          {danger ? (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          ) : (
            <Shield className="w-6 h-6 text-[#1A3E32]" />
          )}
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            {description}
          </p>
        </div>
        {children}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-[#1A3E32]"} disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProfileVisibilityModal({
  onClose,
  currentVisibility,
  onUpdate,
}) {
  const [selected, setSelected] = useState(currentVisibility || "Public");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const options = [
    { value: "Public", description: "Anyone can see your profile" },
    {
      value: "Friends Only",
      description: "Only your friends can see your profile",
    },
    { value: "Private", description: "Only you can see your profile" },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setSaved(true);
    onUpdate?.(selected);
    setTimeout(onClose, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Profile Visibility</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-semibold text-sm">
              Visibility updated!
            </p>
            <p className="text-gray-400 text-xs">Now: {selected}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selected === opt.value
                      ? "bg-[#1A3E32]/10 border border-[#1A3E32]/20"
                      : "border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">
                      {opt.value}
                    </span>
                    {selected === opt.value && (
                      <Check className="w-4 h-4 text-[#1A3E32]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function ChangeEmailModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: enter new email, 2: verify code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    setError("");
    // Simulate API call to send verification code
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep(2);
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setIsLoading(true);
    setError("");
    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {step === 1 ? "Change Email" : "Verify New Email"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-semibold text-sm">
              Email updated successfully!
            </p>
            <p className="text-gray-400 text-xs">Your new email is {email}</p>
          </div>
        ) : step === 1 ? (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="newemail@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30 mt-1"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-xs text-gray-400">
                We'll send a verification code to this email address.
              </p>
            </div>
            <button
              onClick={handleSendCode}
              disabled={!email || isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Verification Code
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
            <div className="flex justify-center gap-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  id={`code-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg font-semibold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30"
                />
              ))}
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <button
              onClick={handleVerifyCode}
              disabled={code.join("").length !== 6 || isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Update Email
            </button>
            <button
              onClick={() => {
                setStep(1);
                setError("");
                setCode(["", "", "", "", "", ""]);
              }}
              className="text-xs text-[#1A3E32] text-center block w-full"
            >
              ← Use different email
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function ChangePasswordField({ placeholder, show, value, onToggle, onChange }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordModal({ onClose, onUpdated }) {
  const { logout } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getTwoFactorStatus()
      .then((data) => {
        if (!cancelled) {
          setTwoFactorEnabled(Boolean(data.enabled));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTwoFactorEnabled(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const passwordPolicyValid = !form.next || isPasswordPolicyValid(form.next);
  const twoFactorValid = !twoFactorEnabled || /^\d{6}$/.test(twoFactorCode.trim());
  const valid =
    form.current.length >= 6 &&
    form.next.length >= 8 &&
    form.next === form.confirm &&
    passwordPolicyValid &&
    twoFactorValid;

  const handleSave = async () => {
    if (!valid || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await changePasswordRequest({
        currentPassword: form.current,
        newPassword: form.next,
        confirmPassword: form.confirm,
        twoFactorCode: twoFactorEnabled ? twoFactorCode.trim() : undefined,
      });
      setSaved(true);
      onUpdated?.();
      setTimeout(() => {
        onClose();
        if (data?.requiresReauth) {
          logout();
        }
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not update password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Change Password</h3>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          <ChangePasswordField
            placeholder="Current password"
            show={show.current}
            value={form.current}
            onToggle={() => toggle("current")}
            onChange={(e) =>
              setForm((f) => ({ ...f, current: e.target.value }))
            }
          />
          <ChangePasswordField
            placeholder="New password"
            show={show.next}
            value={form.next}
            onToggle={() => toggle("next")}
            onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
          />
          <ChangePasswordField
            placeholder="Confirm new password"
            show={show.confirm}
            value={form.confirm}
            onToggle={() => toggle("confirm")}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
          />
          {form.next && !passwordPolicyValid && (
            <p className="text-xs text-red-500">{PASSWORD_POLICY_MESSAGE}</p>
          )}
          {twoFactorEnabled && (
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Authenticator code"
              value={twoFactorCode}
              onChange={(e) =>
                setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30"
            />
          )}
          {form.next && form.confirm && form.next !== form.confirm && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          {form.current && form.current.length < 6 && (
            <p className="text-xs text-red-500">
              Current password must be at least 6 characters
            </p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        {saved ? (
          <div className="flex items-center justify-center gap-2 py-3 text-green-600 font-semibold text-sm">
            <Check className="w-4 h-4" /> Password updated. Sign in again.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid || isLoading}
            className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Password
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

function formatTotpSecret(secret) {
  return String(secret || "")
    .replace(/\s/g, "")
    .match(/.{1,4}/g)
    ?.join(" ") || secret;
}

export function TwoFactorModal({ onClose, onEnabled, onDisabled }) {
  const [view, setView] = useState("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [copied, setCopied] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTwoFactorStatus()
      .then((data) => {
        if (!cancelled) {
          setView(data.enabled ? "enabled" : "intro");
          setPasswordRequired(data.passwordRequired !== false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Could not load 2FA status");
          setView("intro");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const copyText = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await setupTwoFactor(password);
      setSetup(data);
      setCode("");
      setView("scan");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const data = await enableTwoFactor(trimmed, password);
      setBackupCodes(data.backupCodes || []);
      setView("backup");
      onEnabled?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a 6-digit code or a backup code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await disableTwoFactor(trimmed);
      onDisabled?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const lockClose = view === "backup";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={lockClose ? undefined : onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
          {!lockClose && (
            <button onClick={onClose} type="button">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {view === "loading" && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A3E32]" />
          </div>
        )}

        {view === "intro" && (
          <>
            <div className="text-center">
              <Shield className="w-12 h-12 text-[#1A3E32] mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account by requiring a
                verification code in addition to your password.
              </p>
            </div>
            {passwordRequired && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <button
              onClick={handleSetup}
              disabled={isLoading || (passwordRequired && !password)}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Set Up 2FA
            </button>
          </>
        )}

        {view === "scan" && (
          <>
            <div className="text-center">
              <div className="bg-gray-100 p-3 rounded-xl inline-block mx-auto mb-3">
                {setup?.qrCodeDataUrl ? (
                  <img
                    src={setup.qrCodeDataUrl}
                    alt="Authenticator QR code"
                    className="w-40 h-40 rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                    QR unavailable — use the key below
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Scan this QR code with Google Authenticator, Authy, or a similar app
              </p>
              <button
                type="button"
                onClick={() => copyText(setup?.secret || "", "secret")}
                className="text-xs font-mono bg-gray-50 p-2 rounded-lg w-full flex items-center justify-center gap-2"
              >
                {formatTotpSecret(setup?.secret)}
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                {copied === "secret" && (
                  <span className="text-green-600 not-italic font-sans">Copied</span>
                )}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30 text-center tracking-widest"
              maxLength={6}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={isLoading || code.length !== 6}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Enable
            </button>
          </>
        )}

        {view === "backup" && (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                2FA is on. Save these backup codes in a safe place. Each can be
                used once if you lose your authenticator.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2">
              {backupCodes.map((item) => (
                <p key={item} className="font-mono text-xs text-center text-gray-800">
                  {item}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => copyText(backupCodes.join("\n"), "backup")}
              className="w-full py-2 rounded-xl border border-gray-200 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied === "backup" ? "Copied" : "Copy backup codes"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#1A3E32] text-white text-sm font-semibold"
            >
              I saved my backup codes
            </button>
          </>
        )}

        {view === "enabled" && (
          <>
            <div className="text-center">
              <Shield className="w-12 h-12 text-[#1A3E32] mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Two-factor authentication is currently enabled. Enter a code to
                turn it off.
              </p>
            </div>
            <input
              type="text"
              autoComplete="one-time-code"
              placeholder="6-digit code or backup code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 16))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/30 text-center"
              maxLength={16}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleDisable}
              disabled={isLoading || !code.trim()}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Disable 2FA
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
