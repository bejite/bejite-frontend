import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import { ConfirmBadgeModal } from "../modal/confirmBadgeModal";
import {
  getBadgeStatus,
  initializeBadgeSubscription,
} from "../../services/verifiedBadgeApi";

const PAY_PLAN = {
  id: "recruiter_id_badge",
  label: "Recruiter verification",
  price: "5,000",
  currency: "₦",
  period: " one-time",
};

export default function RecruiterVerificationPayGate({
  uploadResult = null,
  hasDocument = false,
  onPaymentComplete,
}) {
  const [status, setStatus] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const payingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const next = await getBadgeStatus();
        if (!cancelled) setStatus(next);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [uploadResult, hasDocument]);

  // Payment modal opens after a successful Upload that needs payment.
  useEffect(() => {
    const fromUpload =
      uploadResult?.needsPayment ?? uploadResult?.data?.needsPayment;
    if (fromUpload) {
      setShowPayModal(true);
    }
  }, [uploadResult]);

  const verificationStatus =
    status?.recruiterVerificationStatus ||
    uploadResult?.recruiterVerificationStatus ||
    uploadResult?.data?.recruiterVerificationStatus;
  const pendingReview =
    Boolean(status?.pendingReview) ||
    Boolean(uploadResult?.pendingReview) ||
    Boolean(uploadResult?.data?.pendingReview);
  const paidForCurrentDocument =
    Boolean(status?.paidForCurrentDocument) ||
    Boolean(uploadResult?.paidForCurrentDocument) ||
    Boolean(uploadResult?.data?.paidForCurrentDocument);
  const paymentComplete =
    pendingReview ||
    paidForCurrentDocument ||
    verificationStatus === "approved";

  useEffect(() => {
    onPaymentComplete?.(paymentComplete);
  }, [paymentComplete, onPaymentComplete]);

  const handleConfirm = async () => {
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setError(null);
    try {
      const init = await initializeBadgeSubscription("NGN");
      if (init?.alreadyPaid || init?.pendingReview) {
        const next = await getBadgeStatus();
        setStatus(next);
        setShowPayModal(false);
        toast.success(
          init?.message ||
            "Payment received. Your document is awaiting admin review.",
        );
        payingRef.current = false;
        setPaying(false);
        return;
      }
      const checkoutUrl = init?.data?.authorization_url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      throw new Error("Unable to start checkout");
    } catch (err) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message || err.message || "Payment failed";
      setError(message);
      toast.error(message);
      if (code !== "PAYMENT_IN_PROGRESS") {
        setShowPayModal(false);
      }
      payingRef.current = false;
      setPaying(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-4 space-y-3 text-left">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Make sure you select a valid document
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          Choose a valid document before you upload. You pay for verification, so
          only submit a document you want reviewed.
        </p>
      </div>

      {pendingReview ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Payment received. Your document is awaiting admin review. You stay
            Unverified until it is approved.
          </p>
        </div>
      ) : null}

      {verificationStatus === "rejected" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Your previous document was not approved. Upload a valid ID, then pay
          ₦5,000 again for a new review.
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AnimatePresence>
        {showPayModal ? (
          <ConfirmBadgeModal
            plan={PAY_PLAN}
            oneTime
            hideCancel
            title="Recruiter verification"
            subtitle="Get a verified badge"
            description="Let people know you are a verified recruiter by paying ₦5,000 to get the verified badge."
            onClose={() => !paying && setShowPayModal(false)}
            onConfirm={handleConfirm}
            isLoading={paying}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
