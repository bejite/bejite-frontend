import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../../config.mjs";
import {
  AlertTriangle,
  UserX,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  MessageSquare,
  Shield,
  HelpCircle,
  Briefcase,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * Reasons configuration for Deactivate and Delete actions.
 * - isSolid: true  -> Considered a valid/conclusive reason; allows proceeding to confirmation modal.
 * - isSolid: false -> Considered an issue that support can help resolve; redirects to the Contact Us page.
 */
const DEACTIVATE_REASONS = [
  {
    id: "break",
    label: "I'm taking a temporary break from job hunting",
    description: "Temporarily hides your profile while preserving all your saved data and applications.",
    isSolid: true,
  },
  {
    id: "found_job",
    label: "I already found a job or hired successfully",
    description: "Congratulations! You can take your profile offline until you need Bejite again.",
    isSolid: true,
  },
  {
    id: "pause_presence",
    label: "I want to temporarily pause my visibility and presence",
    description: "Your profile won't appear in candidate search or recommendations.",
    isSolid: true,
  },
  {
    id: "technical_issues",
    label: "I'm experiencing technical glitches or bugs on Bejite",
    description: "Our technical team can troubleshoot and resolve website bugs for you.",
    isSolid: false,
    supportNote:
      "Don't lose your profile over a glitch! Our technical support team can fix this for you right away.",
  },
  {
    id: "need_help",
    label: "I don't know how to use Bejite or need help finding leads",
    description: "Our career and support team can guide you on getting the best results.",
    isSolid: false,
    supportNote:
      "Our onboarding specialists can guide you through using the platform and optimizing your profile.",
  },
  {
    id: "billing_question",
    label: "I have questions about payments, subscriptions, or billing",
    description: "Billing and subscription matters can be easily adjusted by our support team.",
    isSolid: false,
    supportNote:
      "Our billing team can assist you with your subscription, invoices, or adjustments directly.",
  },
  {
    id: "too_many_notifications",
    label: "I'm getting too many emails or notifications",
    description: "You can turn off email and push notifications directly in settings without deactivating.",
    isSolid: false,
    supportNote:
      "You don't need to deactivate to stop emails! We can help you adjust your notification preferences.",
  },
  {
    id: "other_solid",
    label: "Other personal reason",
    description: "A personal decision to pause your account.",
    isSolid: true,
  },
];

const DELETE_REASONS = [
  {
    id: "found_job_permanent",
    label: "I already found a job or hired and no longer need Bejite",
    description: "You've completed your goals and want to permanently close your account.",
    isSolid: true,
  },
  {
    id: "privacy_erasure",
    label: "I have privacy concerns and want my data permanently erased",
    description: "We will permanently delete your personal information and profile history.",
    isSolid: true,
  },
  {
    id: "duplicate_account",
    label: "I have a duplicate or accidental secondary account",
    description: "Remove this extra account while keeping your main Bejite account active.",
    isSolid: true,
  },
  {
    id: "closing_business",
    label: "I am changing career path or closing my organization",
    description: "You will no longer be using Bejite for hiring or job search.",
    isSolid: true,
  },
  {
    id: "not_getting_results",
    label: "I'm not getting enough job leads, views, or candidate responses",
    description: "Our talent specialists can review your profile or postings to boost your visibility.",
    isSolid: false,
    supportNote:
      "Before deleting all your progress, talk to our recruitment specialists! We can review your profile or job postings to get you noticed.",
  },
  {
    id: "site_glitches",
    label: "The platform has technical errors or features aren't working",
    description: "Technical errors can be investigated and resolved immediately by our engineers.",
    isSolid: false,
    supportNote:
      "Our engineering team can solve technical issues and bugs for you right away. Let us know what went wrong!",
  },
  {
    id: "billing_dispute",
    label: "I have an issue with billing, refunds, or payment methods",
    description: "Deleting your account won't resolve pending invoices or billing inquiries.",
    isSolid: false,
    supportNote:
      "Deleting your account may complicate billing or refund requests. Contact our billing support directly so we can resolve it.",
  },
  {
    id: "bad_experience",
    label: "I had a negative experience with another user or feel unsafe",
    description: "Our Trust & Safety team actively investigates reports and takes immediate action.",
    isSolid: false,
    supportNote:
      "Your safety and comfort are our top priority. Please contact our Trust & Safety team so we can address bad actors.",
  },
  {
    id: "other_solid",
    label: "Other personal reason",
    description: "A permanent decision to erase your Bejite profile.",
    isSolid: true,
  },
];

export default function AccountActionFlowModal({
  isOpen,
  mode = "delete", // "deactivate" | "delete"
  onClose,
  onConfirm, // async ({ reasonId, details, password, googleToken }) => void; throws on failure
  onRedirectContact,
  passwordRequired, // false for Google sign-in accounts; undefined when unknown
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Reason Selection, 2: Final Confirmation
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [otherText, setOtherText] = useState("");
  const [usesGoogle, setUsesGoogle] = useState(passwordRequired === false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleToken, setGoogleToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isDelete = mode === "delete";
  const reasons = isDelete ? DELETE_REASONS : DEACTIVATE_REASONS;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedReasonId("");
      setOtherText("");
      setPassword("");
      setShowPassword(false);
      setGoogleToken("");
      setSubmitting(false);
      setSubmitError("");
    }
  }, [isOpen, mode]);

  useEffect(() => {
    setUsesGoogle(passwordRequired === false);
  }, [passwordRequired]);

  if (!isOpen) return null;

  // Handle clicking "Next" from Step 1
  const handleStep1Next = () => {
    if (!selectedReason) return;

    // If the reason is NOT solid (i.e. not reasonable/not enough for leaving; support can resolve it):
    if (!selectedReason.isSolid) {
      onClose();
      if (onRedirectContact) {
        onRedirectContact(selectedReason.label);
      } else {
        navigate("/contact", {
          state: {
            reason: selectedReason.label,
            action: isDelete ? "account_deletion" : "account_deactivation",
          },
        });
      }
      return;
    }

    // Reason IS solid -> Proceed to Step 2 ("Are you sure?")
    setStep(2);
  };

  const confirmBlocked =
    submitting || (isDelete && (usesGoogle ? !googleToken : !password));

  // Handle final confirmation in Step 2
  const handleFinalConfirm = async () => {
    if (confirmBlocked) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onConfirm({
        reasonId: selectedReasonId,
        details: selectedReasonId === "other_solid" ? otherText.trim() : "",
        ...(isDelete && !usesGoogle ? { password } : {}),
        ...(isDelete && usesGoogle ? { googleToken } : {}),
      });
    } catch (error) {
      if (error?.code === "REAUTH_REQUIRED" && /google/i.test(error.message || "")) {
        setUsesGoogle(true);
        setSubmitError("This account uses Google sign-in. Confirm with Google to continue.");
      } else if (error?.code === "REAUTH_FAILED" && usesGoogle) {
        setGoogleToken("");
        setSubmitError("That Google account doesn't match this Bejite account.");
      } else {
        setSubmitError(error?.message || "Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-100 relative my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Reason Selection */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 pr-8">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDelete ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                }`}
              >
                {isDelete ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <UserX className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isDelete ? "Delete Your Account" : "Deactivate Your Account"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                  We're sorry to see you go. Please let us know why you'd like to{" "}
                  {isDelete ? "permanently delete" : "temporarily deactivate"} your account.
                </p>
              </div>
            </div>

            {/* Reasons List */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-2.5 nfl-scroll">
              {reasons.map((reason) => {
                const isSelected = selectedReasonId === reason.id;
                return (
                  <div
                    key={reason.id}
                    onClick={() => setSelectedReasonId(reason.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? isDelete
                          ? "border-red-400 bg-red-50/40 shadow-xs ring-1 ring-red-400"
                          : "border-[#1A3E32] bg-[#1A3E32]/5 shadow-xs ring-1 ring-[#1A3E32]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    {/* Custom Radio Button */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? isDelete
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-[#1A3E32] bg-[#1A3E32] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs sm:text-sm font-semibold ${
                            isSelected ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {reason.label}
                        </p>
                        {!reason.isSolid && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            Support can help
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* If 'Other' is selected, show optional textarea */}
            {selectedReasonId === "other_solid" && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Optional details (tell us more):
                </label>
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Share any additional feedback..."
                  maxLength={1000}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A3E32]/20 resize-none"
                />
              </div>
            )}

            {/* Explanatory Banner when Insufficient (Support-Resolvable) Reason is Chosen */}
            {selectedReason && !selectedReason.isSolid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold">We can help resolve this right now!</p>
                  <p className="mt-0.5 text-emerald-800">{selectedReason.supportNote}</p>
                  <p className="mt-1 font-semibold text-emerald-900">
                    Clicking continue will take you to our Contact Us page so our team can assist you directly.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons for Step 1 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedReasonId}
                onClick={handleStep1Next}
                className={`flex-1 py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedReason && !selectedReason.isSolid
                    ? "bg-[#1A3E32] hover:bg-[#153228] shadow-md shadow-[#1A3E32]/20"
                    : isDelete
                    ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    : "bg-[#1A3E32] hover:bg-[#153228] shadow-md shadow-[#1A3E32]/20"
                }`}
              >
                <span>
                  {selectedReason && !selectedReason.isSolid
                    ? "Contact Support Instead"
                    : "Next"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Final Confirmation ("Are you sure?") */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Header with Warning Icon */}
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3.5 ${
                  isDelete
                    ? "bg-red-100 text-red-600 ring-8 ring-red-50"
                    : "bg-amber-100 text-amber-600 ring-8 ring-amber-50"
                }`}
              >
                {isDelete ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <UserX className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {isDelete
                  ? "Are you sure you want to delete your account?"
                  : "Are you sure you want to deactivate your account?"}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed px-2">
                {isDelete
                  ? "This action is permanent and cannot be undone. All your profile information, job applications, connections, and posts will be permanently wiped from Bejite."
                  : "Your profile will be temporarily hidden from other users, recruiters, and companies. You can reactivate anytime simply by logging back in with your credentials."}
              </p>
            </div>

            {/* Selected Reason Confirmation Box */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                ✓
              </div>
              <div className="text-xs min-w-0 flex-1">
                <span className="text-gray-400 font-medium">Your reason for leaving:</span>
                <p className="font-bold text-gray-900 mt-0.5 [overflow-wrap:anywhere] max-h-28 overflow-y-auto nfl-scroll">
                  {selectedReasonId === "other_solid" && otherText.trim()
                    ? otherText.trim()
                    : selectedReason?.label}
                </p>
              </div>
            </div>

            {/* Confirm it's you (delete only) */}
            {isDelete && !usesGoogle && (
              <div>
                <label
                  htmlFor="delete-account-password"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    id="delete-account-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (submitError) setSubmitError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinalConfirm();
                    }}
                    disabled={submitting}
                    placeholder="Current password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {isDelete && usesGoogle && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Confirm it's you by signing in with Google
                </p>
                {googleToken ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google account confirmed</span>
                  </div>
                ) : GOOGLE_CLIENT_ID ? (
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={(response) => {
                        setGoogleToken(response?.credential || "");
                        setSubmitError("");
                      }}
                      onError={() =>
                        setSubmitError("Google sign-in was cancelled or failed. Please try again.")
                      }
                      text="continue_with"
                      shape="pill"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Google confirmation isn't available right now. Please contact support to
                    delete your account.
                  </p>
                )}
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitError("");
                  setStep(1);
                }}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Reason</span>
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={confirmBlocked}
                className={`flex-1 py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDelete
                    ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30"
                    : "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/30"
                }`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDelete ? (
                  <span>{submitting ? "Deleting..." : "Delete Account Forever"}</span>
                ) : (
                  <span>{submitting ? "Deactivating..." : "Deactivate Account"}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
